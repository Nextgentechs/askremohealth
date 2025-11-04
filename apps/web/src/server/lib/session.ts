import { z } from 'zod'
import crypto from 'crypto'
import { redisClient } from '@web/redis/redis'
import { db } from '../db'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema'

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7
const COOKIE_SESSION_KEY = 'session-id'

/**
 * Session schema: id + email are required, role is optional but preferred.
 * We store role when possible to avoid an extra DB lookup on every request.
 */
export const sessionSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z
    .enum(['patient', 'doctor', 'admin', 'lab'])
    .optional(),
})

export const adminSessionSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.literal('admin'),
})
type AdminSession = z.infer<typeof adminSessionSchema>
type UserSession = z.infer<typeof sessionSchema>

type CookieOptions = {
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  maxAge?: number
  path?: string
  domain?: string
}

export type Cookies = {
  set: (key: string, value: string, options: Partial<CookieOptions>) => void
  get: (key: string) => { name: string; value: string } | undefined
  delete: (key: string) => void
}

/**
 * Create a session in Redis and return the sessionId.
 * Also store the user's role (if available) in the session so downstream logic
 * can make routing decisions without an extra DB query.
 */
export async function createUserSession(user: UserSession) {
  // Attempt to enrich the session with role from DB if not provided
  let role = (user as any).role // maybe caller provided it
  if (!role) {
    try {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { role: true, email: true },
      })
      if (dbUser?.role) role = dbUser.role
      // ensure email is taken from DB if possible
      if (!user.email && dbUser?.email) user.email = dbUser.email
    } catch (err) {
      console.warn('createUserSession: failed to fetch user role from DB', err)
    }
  }

  const sessionPayload: UserSession = {
    id: user.id,
    email: user.email,
    ...(role ? { role } : {}),
  }

  const sessionId = crypto.randomBytes(32).toString('hex')
  await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionSchema.parse(sessionPayload)), {
    ex: SESSION_EXPIRATION_SECONDS, // node-redis v4 style
  })
  return sessionId
}

/**
 * Only for server-side usage (SSR).
 * `cookies` should be the Next.js cookies() object or similar.
 * Returns an enriched user object (id, email, role) or null.
 */
export async function getUserFromSession(cookies: Pick<Cookies, 'get'>) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null
  // Try to return the session (including role) directly
  const session = await getUserSessionById(sessionId)
  if (session) {
    // If role exists in session, return immediately
    if (session.role) return session
    // Otherwise try to fetch fresh user data from DB to add role
    try {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        columns: { id: true, email: true, role: true },
      })
      if (!dbUser) return null
      const enriched = { id: dbUser.id, email: dbUser.email ?? session.email, role: dbUser.role }
      // update Redis session with role so future requests are faster
      await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionSchema.parse(enriched)), {
        ex: SESSION_EXPIRATION_SECONDS,
      })
      return enriched
    } catch (err) {
      console.error('getUserFromSession: DB lookup failed', err)
      return session // fallback to whatever session had
    }
  }
  return null
}

/**
 * Update session payload (user info) for the session referenced by cookie
 */
export async function updateUserSessionData(user: UserSession, cookies: Pick<Cookies, 'get'>) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null
  await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionSchema.parse(user)), {
    ex: SESSION_EXPIRATION_SECONDS,
  })
}

/**
 * Update only the expiration (keep payload unchanged)
 */
export async function updateUserSessionExpiration(cookies: Pick<Cookies, 'get'>) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null
  const user = await getUserSessionById(sessionId)
  if (!user) return
  await redisClient.set(`session:${sessionId}`, JSON.stringify(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  })
}

/**
 * Remove session from Redis and delete cookie (server-side)
 */
export async function removeUserFromSession(cookies: Pick<Cookies, 'get' | 'delete'>) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null
  await redisClient.del(`session:${sessionId}`)
  cookies.delete(COOKIE_SESSION_KEY)
}

/**
 * Use this ONLY in API routes where you have access to the cookies() object from next/headers
 * This sets the cookie correctly for cross-subdomain usage.
 */
export function setCookie(sessionId: string, cookies: Pick<Cookies, 'set'>) {
  const isProd = process.env.NODE_ENV === 'production'
  const cookieOptions: Partial<CookieOptions> = {
    path: '/',
    secure: isProd, // secure must be true for SameSite=None to work in browsers
    httpOnly: true, // server-only
    sameSite: isProd ? 'none' : 'lax', // none in prod for cross-subdomain; lax in dev
    maxAge: SESSION_EXPIRATION_SECONDS,
  }

  // In production, set cookie domain to parent domain so all subdomains receive it.
  if (isProd) {
    cookieOptions.domain = '.askremohealth.com' // leading dot ok in Set-Cookie
  } else {
    // For local development don't set a domain (browser will use host of response)
    // DO NOT set domain to ".localhost" - invalid
  }

  cookies.set(COOKIE_SESSION_KEY, sessionId, cookieOptions)
}

/**
 * Get session payload by sessionId (returns the parsed object stored in Redis,
 * or null if missing/invalid).
 */
export async function getUserSessionById(sessionId: string) {
  const rawUser = await redisClient.get(`session:${sessionId}`)
  if (!rawUser || typeof rawUser !== 'string') return null
  const parsed = sessionSchema.safeParse(JSON.parse(rawUser))
  return parsed.success ? parsed.data : null
}

/**
 * Validate admin session: ensure entry exists and corresponds to a DB user with role 'admin'
 */
export async function getAdminSessionById(sessionId: string): Promise<AdminSession | null> {
  console.log('getAdminSessionById called with sessionId:', sessionId)
  try {
    const rawUser = await redisClient.get(`session:${sessionId}`)
    if (!rawUser || typeof rawUser !== 'string') {
      console.log('No session found for ID:', sessionId)
      return null
    }

    const parsed = sessionSchema.safeParse(JSON.parse(rawUser))
    if (!parsed.success) {
      console.log('Failed to parse session data:', parsed.error)
      return null
    }

    const sessionUser = parsed.data
    console.log('Session user found:', sessionUser)

    // If role is present and admin, return directly
    if (sessionUser.role === 'admin') {
      return { id: sessionUser.id, email: sessionUser.email ?? '', role: 'admin' }
    }

    // Otherwise, ensure DB user is admin (fallback)
    const user = await db.query.users.findFirst({
      where: eq(users.id, sessionUser.id),
      columns: { id: true, email: true, role: true },
    })

    if (!user) {
      console.log('No user found in database for ID:', sessionUser.id)
      return null
    }

    if (user.role !== 'admin') {
      console.log('User is not an admin. Role:', user.role)
      return null
    }

    const adminSession: AdminSession = {
      id: user.id,
      email: user.email ?? '',
      role: 'admin',
    }

    console.log('Admin session validated successfully:', adminSession)
    return adminSession
  } catch (error) {
    console.error('Error in getAdminSessionById:', error)
    return null
  }
}
