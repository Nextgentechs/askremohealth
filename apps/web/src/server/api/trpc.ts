import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'

import { db } from '@web/server/db'
import { users } from '@web/server/db/schema'
import { redisClient } from '@web/redis/redis'
import { sessionSchema } from '@web/server/lib/session'

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  user: typeof users.$inferSelect | null
  db: typeof db
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    db: opts.db, // Add this line
  }
}

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async () => {
  const cookieStore = await cookies()
  let user = null

  // First try to get user from Redis session (email/password login)
  const sessionToken = cookieStore.get('session-id')?.value
  
  if (sessionToken) {
    const rawSession = await redisClient.get(`session:${sessionToken}`)
    
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

  // If no Redis session, try direct database lookup (Google OAuth)
  if (!user && sessionToken) {
    user = await db.query.users.findFirst({
      where: eq(users.id, sessionToken),
    })
  }

  // Ensure user is null if it's undefined
  if (user === undefined) {
    user = null;
  }

  return createInnerTRPCContext({
    user,
    db, // Now db is defined
  })
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
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
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "src/server/api/routers" directory.
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
 * Protected (authenticated) procedure.
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user,
      db: ctx.db, // Add this line
    },
  })
})

/**
 * Doctor-only procedure
 */
export const doctorProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  
  if (ctx.user.role !== 'doctor') {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Access denied. Only doctors can access this resource.' 
    })
  }
  
  return next({
    ctx: {
      user: ctx.user,
      db: ctx.db, // Add this line
    },
  })
})

/**
 * Admin-only procedure
 */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Access denied. Only admins can access this resource.' 
    })
  }
  
  return next({
    ctx: {
      user: ctx.user,
      db: ctx.db, // Add this line
    },
  })
})

export const createCallerFactory = t.createCallerFactory
