import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import { db } from 'src/server/db'
import { sessions, users } from 'src/server/db/schema'
import type { Session, User } from 'lucia'
import { Lucia, TimeSpan } from 'lucia'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { type User as DatabaseUserAttributes } from 'src/server/db/schema'

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users)

export const lucia = new Lucia(adapter, {
  getUserAttributes: (user) => ({
    role: user.role,
    isAdmin: user.isAdmin,
  }),
  sessionExpiresIn: new TimeSpan(180, 'd'),
  sessionCookie: {
    attributes: {
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    },
  },
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

export const session = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId =
      (await cookies()).get(lucia.sessionCookieName)?.value ?? null
    if (!sessionId) return { user: null, session: null }

    const result = await lucia.validateSession(sessionId)
    try {
      if (result.session?.fresh) {
        const cookie = lucia.createSessionCookie(result.session.id)
        const cookieStore = await cookies()
        cookieStore.set(cookie.name, cookie.value, cookie.attributes)
      }
      if (!result.session) {
        const cookie = lucia.createBlankSessionCookie()
        const cookieStore = await cookies()
        cookieStore.set(cookie.name, cookie.value, cookie.attributes)
      }
    } catch {}
    return result
  },
)
