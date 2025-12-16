import { redisClient } from '@web/redis/redis'
import crypto from 'crypto'
import { z } from 'zod'

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7
const COOKIE_SESSION_KEY = 'session-id'

export const sessionSchema = z.object({
  id: z.string(),
  email: z.string(),
})

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

// Create a session in Redis and return the sessionId (do not set cookies here)
export async function createUserSession(user: UserSession) {
  const sessionId = crypto.randomBytes(32).toString('hex')
  const sessionKey = `session:${sessionId}`
  const userSessionsKey = `user:sessions:${user.id}`

  await redisClient
    .multi()
    .set(sessionKey, JSON.stringify(sessionSchema.parse(user)), {
      ex: SESSION_EXPIRATION_SECONDS,
    })
    .sadd(userSessionsKey, sessionId)
    .expire(userSessionsKey, SESSION_EXPIRATION_SECONDS)
    .exec()

  return sessionId
}

export async function invalidateUserSessions(userId: string) {
  const userSessionsKey = `user:sessions:${userId}`
  const sessionIds = await redisClient.smembers(userSessionsKey)

  if (sessionIds.length > 0) {
    const pipeline = redisClient.multi()
    sessionIds.forEach((sessionId) => {
      pipeline.del(`session:${sessionId}`)
    })
    pipeline.del(userSessionsKey)
    await pipeline.exec()
  }
}

// Only for server-side usage (SSR, not API route)
export function getUserFromSession(cookies: Pick<Cookies, 'get'>) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null

  return getUserSessionById(sessionId)
}

export async function updateUserSessionData(
  user: UserSession,
  cookies: Pick<Cookies, 'get'>,
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null

  await redisClient.set(
    `session:${sessionId}`,
    JSON.stringify(sessionSchema.parse(user)),
    {
      ex: SESSION_EXPIRATION_SECONDS,
    },
  )
}

// Only update expiration in Redis (do not set cookies here)
export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, 'get'>,
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null

  const user = await getUserSessionById(sessionId)
  if (!user) return

  await redisClient.set(`session:${sessionId}`, JSON.stringify(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  })
}

// Remove session from Redis and delete cookie (for SSR/server-side usage)
export async function removeUserFromSession(
  cookies: Pick<Cookies, 'get' | 'delete'>,
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null

  await redisClient.del(`session:${sessionId}`)
  cookies.delete(COOKIE_SESSION_KEY)
}

// Use this ONLY in API routes where you have access to the cookies() object from next/headers
/**
 * Sets the session cookie with secure defaults
 * SECURITY: httpOnly: true prevents XSS attacks from accessing session
 * @param sessionId - The unique session identifier
 * @param cookies - Cookie handler object
 */
export function setCookie(sessionId: string, cookies: Pick<Cookies, 'set'>) {
  const cookieOptions: Partial<CookieOptions> = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // SECURITY: Prevents JavaScript access to session cookie
    sameSite: 'lax',
    maxAge: SESSION_EXPIRATION_SECONDS,
  }

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.domain = '.askremohealth.com'
  }

  cookies.set(COOKIE_SESSION_KEY, sessionId, cookieOptions)
}

async function getUserSessionById(sessionId: string) {
  const rawUser = await redisClient.get(`session:${sessionId}`)
  if (!rawUser || typeof rawUser !== 'string') return null

  const parsed = sessionSchema.safeParse(JSON.parse(rawUser))
  return parsed.success ? parsed.data : null
}
