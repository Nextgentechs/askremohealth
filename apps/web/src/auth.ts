import { eq } from 'drizzle-orm'
import { db } from './server/db'
import { users, labs } from './server/db/schema'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserSessionById } from './server/lib/session'

// Helper function to infer the type of a user with their lab relation
async function getUserWithLabQuery() {
  return await db.query.users.findFirst({
    with: {
      lab: true,
    },
  });
}

type UserWithLab = Awaited<ReturnType<typeof getUserWithLabQuery>>;

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID!
const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://staging.askremohealth.com' 
  : 'http://localhost:3001'

// Generate Google OAuth URL
export function getGoogleAuthUrl(role: 'doctor' | 'admin' | 'patient' | 'lab' = 'doctor', callbackUrl?: string) {
  const redirectUri = `${BASE_URL}/api/auth/google/callback`
  const scope = 'email profile'
  const state = btoa(JSON.stringify({ role, callbackUrl })) // Encode role in state

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    scope,
    response_type: 'code',
    state,
    access_type: 'offline',
    prompt: 'consent'
  })
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Exchange code for tokens
async function exchangeCodeForTokens(code: string) {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${BASE_URL}/api/auth/google/callback`,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange code for tokens')
  }

  return tokenResponse.json()
}

// Get user info from Google
async function getGoogleUserInfo(accessToken: string) {
  const userResponse = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
  )

  if (!userResponse.ok) {
    throw new Error('Failed to get user info from Google')
  }

  return userResponse.json()
}

// Create or update user in database
async function createOrUpdateUser(googleUser: { email: string, given_name: string, family_name: string }, role: string) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, googleUser.email),
  })

  if (!existingUser) {
    // Prevent new admin accounts from being created
    /*if (role === 'admin') {
      throw new Error('Cannot create new admin accounts via this method.')
    }*/

    // Insert new user
    const [newUser] = await db.insert(users).values({
      email: googleUser.email,
      firstName: googleUser.given_name ?? '',
      lastName: googleUser.family_name ?? '',
      role: role as 'doctor' | 'patient' | 'admin' | 'lab',
      password: '',
    }).returning()
    
    return newUser
  }

  return existingUser
}

import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Set session cookie
function setSessionCookie(userId: string, cookies: ReadonlyRequestCookies) {
  const domain = process.env.NODE_ENV === 'production' ? '.askremohealth.com' : '.localhost'
  
  cookies.set('session-id', userId, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    domain
  })
}

// Get current user from session - handles both Redis and direct database sessions
export async function getCurrentUser(): Promise<UserWithLab | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session-id')?.value
    
    if (!sessionId) {
      return null
    }

    // First, try to get user from Redis session (email/password login)
    const redisUser = await getUserSessionById(sessionId)
    
    if (redisUser) {
      // If we have a Redis session, get the full user from database using the user ID from the session
      const user = await db.query.users.findFirst({
        where: eq(users.id, redisUser.id),
        with: {
          lab: true,
        },
      })
      return user
    }

    // If no Redis session, try direct database lookup (Google OAuth)
    const user = await db.query.users.findFirst({
      where: eq(users.id, sessionId),
      with: {
        lab: true,
      },
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Sign out user
export async function signOut() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session-id')?.value
    
    if (sessionId) {
      // Clear Redis session if it exists
      const redisClient = (await import('@web/redis/redis')).redisClient
      await redisClient.del(`session:${sessionId}`)
    }
    
    // Clear the session cookie
    cookieStore.set('session-id', '', { 
      maxAge: 0,
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : '.localhost'
    })
  } catch (error) {
    console.error('Error during sign out:', error)
  }
}

// Handle Google OAuth callback
export async function handleGoogleCallback(code: string, state: string) {
  try {
    // Decode state to get role
    const { role, callbackUrl } = JSON.parse(atob(state))

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    
    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token)
    
    // Create or update user in database
    const user = await createOrUpdateUser(googleUser, role)
    
    if (!user) {
      throw new Error('Failed to create or update user')
    }
    
    // Set session cookie
    const cookieStore = await cookies()
    setSessionCookie(user.id, cookieStore)

    return { success: true, user, callbackUrl }
  } catch (error) {
    console.error('Google OAuth error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Require authentication middleware
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth')
  }
  return user
}

// Require specific role middleware
export async function requireRole(role: 'doctor' | 'patient' | 'admin' | 'lab') {
  const user = await getCurrentUser()
  if (!user || user.role !== role) {
    redirect('/')
  }
  return user
}
