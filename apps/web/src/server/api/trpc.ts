// server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { redisClient } from '@web/redis/redis'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { db } from '../db'
import { users } from '../db/schema'
import { sessionSchema } from '../lib/session'

type CookieOptions = {
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  maxAge?: number
}

export async function createTRPCContext({ req }: FetchCreateContextFnOptions) {
  // Await cookies() before using it!

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session-id')?.value

  let user = null
  if (sessionToken) {
    const rawSession = await redisClient.get(`session:${sessionToken}`)
    // console.log('Raw Session:', rawSession)
    if (rawSession) {
      const parsed = sessionSchema.safeParse(
        typeof rawSession === 'string' ? JSON.parse(rawSession) : rawSession,
      )
      if (parsed.success) {
        // Fetch the full user from the database
        user = await db.query.users.findFirst({
          where: eq(users.id, parsed.data.id),
        })
      }
    }
  }

  // console.log('tRPC context user:', user)

  return {
    req,
    db,
    cookies: {
      get: (key: string) => {
        const cookie = cookieStore.get(key)
        return cookie ? { name: cookie.name, value: cookie.value } : undefined
      },
      set: (
        key: string,
        value: string,
        options: Partial<CookieOptions> = {},
      ) => {
        cookieStore.set(key, value, {
          secure: options.secure ?? true,
          httpOnly: options.httpOnly ?? false,
          sameSite: options.sameSite ?? 'lax',
          maxAge: options.maxAge,
        })
      },
      delete: (key: string) => cookieStore.delete(key),
    },
    user,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { user: ctx.user } })
})

/**
 * this filters out queries and mutations that are only accessible to doctors
 */

const doctorMiddleware = t.middleware(({ ctx, next }) => {
  return next({ ctx: { user: ctx.user } })
})

/**
 * this filters out queries and mutations that are only accessible to admins
 */

const adminMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({ ctx: { user: ctx.user } })
})
/**
 * Authenticated procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const procedure = t.procedure.use(authMiddleware)
export const doctorProcedure = t.procedure.use(doctorMiddleware)

export const adminProcedure = t.procedure.use(adminMiddleware)
