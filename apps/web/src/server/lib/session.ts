import { z } from 'zod'
import crypto from "crypto"
import { redisClient } from '@web/redis/redis'
import { db } from '../db' // Add this import
import { eq } from 'drizzle-orm' // Add this import
import { users } from '../db/schema' // Add this import


const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7
const COOKIE_SESSION_KEY = "session-id"

export const sessionSchema = z.object({
  id: z.string(),
  email: z.string()
})
export const adminSessionSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.literal('admin'), // only accept admin role
});
type AdminSession = z.infer<typeof adminSessionSchema>;

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
export async function createUserSession(
  user: UserSession
) {
  const sessionId = crypto.randomBytes(32).toString("hex") 
  await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionSchema.parse(user)), {
    ex: SESSION_EXPIRATION_SECONDS,
  })
  return sessionId
}

// Only for server-side usage (SSR, not API route)
export function getUserFromSession(cookies: Pick<Cookies, "get">) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null

  return getUserSessionById(sessionId)
}

export async function updateUserSessionData(
  user: UserSession,
  cookies: Pick<Cookies, "get">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null

  await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionSchema.parse(user)), {
    ex: SESSION_EXPIRATION_SECONDS,
  })
}

// Only update expiration in Redis (do not set cookies here)
export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, "get">
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
  cookies: Pick<Cookies, "get" | "delete">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null

  await redisClient.del(`session:${sessionId}`)
  cookies.delete(COOKIE_SESSION_KEY)
}

// Use this ONLY in API routes where you have access to the cookies() object from next/headers
export function setCookie(sessionId: string, cookies: Pick<Cookies, "set">) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
    sameSite: "lax",
    maxAge: SESSION_EXPIRATION_SECONDS,
    domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : '.localhost'
  })
}

// Export this function so it can be used in auth.ts
export async function getUserSessionById(sessionId: string) {
  const rawUser = await redisClient.get(`session:${sessionId}`)
  if (!rawUser || typeof rawUser !== 'string') return null

  const parsed = sessionSchema.safeParse(JSON.parse(rawUser))
  return parsed.success ? parsed.data : null
}
export async function getAdminSessionById(sessionId: string): Promise<AdminSession | null> {
  console.log('getAdminSessionById called with sessionId:', sessionId);
  
  try {
    // First get the basic session data
    const rawUser = await redisClient.get(`session:${sessionId}`)
    if (!rawUser || typeof rawUser !== 'string') {
      console.log('No session found for ID:', sessionId);
      return null;
    }

    const parsed = sessionSchema.safeParse(JSON.parse(rawUser))
    if (!parsed.success) {
      console.log('Failed to parse session data:', parsed.error);
      return null;
    }

    const sessionUser = parsed.data;
    console.log('Session user found:', sessionUser);

    // Check if the user is an admin by querying the database
    const user = await db.query.users.findFirst({
      where: eq(users.id, sessionUser.id),
    });

    if (!user) {
      console.log('No user found in database for ID:', sessionUser.id);
      return null;
    }

    console.log('User found in database:', { id: user.id, email: user.email, role: user.role });

    if (user.role !== 'admin') {
      console.log('User is not an admin. Role:', user.role);
      return null;
    }

    // Return admin session with role
    const adminSession: AdminSession = {
      id: user.id,
      email: user.email || '',
      role: 'admin'
    };

    console.log('Admin session validated successfully:', adminSession);
    return adminSession;

  } catch (error) {
    console.error('Error in getAdminSessionById:', error);
    return null;
  }
}