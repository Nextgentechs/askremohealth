import { z } from 'zod'
import crypto from "crypto"
import { redisClient } from '@web/redis/redis'

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7
const COOKIE_SESSION_KEY = "session-id"

export const sessionSchema = z.object({
  id: z.string(),
  email: z.string()
})

type UserSession = z.infer<typeof sessionSchema>

export type Cookies = {
  set: (key: string, value: string, options: any) => void
  get: (key: string) => { name: string; value: string } | undefined
  delete: (key: string) => void
}

export async function createUserSession(
  user: UserSession,
  cookies: Pick<Cookies, "set">
) {
  const sessionId = crypto.randomBytes(32).toString("hex") 
  await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionSchema.parse(user)), {
    ex: SESSION_EXPIRATION_SECONDS,
  })

  setCookie(sessionId, cookies)
  console.log('session created successfully')
}

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

export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, "get" | "set">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null

  const user = await getUserSessionById(sessionId)
  if (!user) return

  await redisClient.set(`session:${sessionId}`, JSON.stringify(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  })
  setCookie(sessionId, cookies)
}

export async function removeUserFromSession(
  cookies: Pick<Cookies, "get" | "delete">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (!sessionId) return null

  await redisClient.del(`session:${sessionId}`)
  cookies.delete(COOKIE_SESSION_KEY)
}

function setCookie(sessionId: string, cookies: Pick<Cookies, "set">) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    path: '/',
    secure: false,
    httpOnly: false,
    sameSite: "lax",
    maxAge: SESSION_EXPIRATION_SECONDS
  })
}

async function getUserSessionById(sessionId: string) {
  const rawUser = await redisClient.get(`session:${sessionId}`)
  if (!rawUser) return null

  const parsed = sessionSchema.safeParse(JSON.parse(rawUser))
  return parsed.success ? parsed.data : null
}
