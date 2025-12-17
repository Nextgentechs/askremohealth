import { eq } from 'drizzle-orm'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies as nextCookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { db } from './server/db'
import { users } from './server/db/schema'
import { getUserSessionById } from './server/lib/session'

// Helper to infer user with lab relation
async function getUserWithLabQuery() {
  return await db.query.users.findFirst({
    with: { lab: true },
  })
}

type UserWithLab = Awaited<ReturnType<typeof getUserWithLabQuery>>

/**
 * NextAuth-compatible auth function
 * Returns session object with user info for tRPC context
 */
export async function auth(): Promise<{
  user: { email: string } | null
} | null> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return null
    return { user: { email: currentUser.email ?? '' } }
  } catch {
    return null
  }
}

// Google OAuth config
const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID!
const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://staging.askremohealth.com'
    : 'http://localhost:3001'

// --- GOOGLE OAUTH FUNCTIONS ---

export function getGoogleAuthUrl(
  role: 'doctor' | 'admin' | 'patient' | 'lab' = 'doctor',
  callbackUrl?: string,
) {
  const redirectUri = `${BASE_URL}/api/auth/google/callback`
  const scope = 'email profile'
  const state = btoa(JSON.stringify({ role, callbackUrl }))

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    scope,
    response_type: 'code',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

async function exchangeCodeForTokens(code: string) {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${BASE_URL}/api/auth/google/callback`,
    }),
  })

  if (!tokenResponse.ok) throw new Error('Failed to exchange code for tokens')
  return tokenResponse.json()
}

async function getGoogleUserInfo(accessToken: string) {
  const userResponse = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
  )
  if (!userResponse.ok) throw new Error('Failed to get user info from Google')
  return userResponse.json()
}

async function createOrUpdateUser(
  googleUser: { email: string; given_name: string; family_name: string },
  role: string,
) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, googleUser.email),
  })

  if (!existingUser) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: googleUser.email,
        firstName: googleUser.given_name ?? '',
        lastName: googleUser.family_name ?? '',
        role: role as 'doctor' | 'patient' | 'admin' | 'lab',
        password: '',
      })
      .returning()

    return newUser
  }

  return existingUser
}

// --- SESSION HANDLING ---

function setSessionCookie(userId: string, cookieStore: ReadonlyRequestCookies) {
  const domain =
    process.env.NODE_ENV === 'production' ? '.askremohealth.com' : '.localhost'
  cookieStore.set('session-id', userId, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    domain,
  })
}

// Get current user safely for SSR and hydration
export async function getCurrentUser(): Promise<UserWithLab | null> {
  try {
    const cookieStore = await nextCookies()
    const sessionId = cookieStore.get('session-id')?.value
    if (!sessionId) return null

    // Try Redis session first
    const redisUser = await getUserSessionById(sessionId)
    if (redisUser) {
      return await db.query.users.findFirst({
        where: eq(users.id, redisUser.id),
        with: { lab: true },
      })
    }

    // Fallback: direct DB session (Google OAuth)
    return await db.query.users.findFirst({
      where: eq(users.id, sessionId),
      with: { lab: true },
    })
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Sign out user completely
export async function signOut(req: NextRequest) {
  try {
    const cookiesResolved = await nextCookies()
    const sessionId = cookiesResolved.get('session-id')?.value

    // Delete session in Redis
    if (sessionId) {
      const { redisClient } = await import('@web/redis/redis')
      await redisClient.del(`session:${sessionId}`)
    }

    // Dynamically set domain for clearing cookie
    const host = req.headers.get('host') || ''
    const domain =
      process.env.NODE_ENV === 'production'
        ? host // exact host, e.g., admin.askremohealth.com
        : undefined // localhost, omit domain

    const response = NextResponse.json({ success: true })

    response.cookies.set('session-id', '', {
      maxAge: 0,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      domain,
    })

    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 })
  }
}

// --- GOOGLE CALLBACK ---

export async function handleGoogleCallback(code: string, state: string) {
  try {
    const { role, callbackUrl } = JSON.parse(atob(state))
    const tokens = await exchangeCodeForTokens(code)
    const googleUser = await getGoogleUserInfo(tokens.access_token)
    const user = await createOrUpdateUser(googleUser, role)

    if (!user) throw new Error('Failed to create or update user')

    const cookieStore = await nextCookies()
    setSessionCookie(user.id, cookieStore)

    return { success: true, user, callbackUrl }
  } catch (error) {
    console.error('Google OAuth error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// --- MIDDLEWARE HELPERS ---

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')
  return user
}

export async function requireRole(
  role: 'doctor' | 'patient' | 'admin' | 'lab',
) {
  const user = await getCurrentUser()
  if (!user || user.role !== role) redirect('/')
  return user
}
