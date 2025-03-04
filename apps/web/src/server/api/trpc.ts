/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { getAuth } from '@clerk/nextjs/server'
import { initTRPC, TRPCError } from '@trpc/server'
import { db } from '@web/server/db'
import { NextRequest } from 'next/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

/**
 * 1. CONTEXT
 * This section defines the "contexts" that are available in the backend API.
 * These allow you to access things when processing a request, like the database, the session, etc.
 * @see https://trpc.io/docs/server/context
 */

export const createTRPCContext = async (opts: { req: Request }) => {
  // Clone the request before creating NextRequest to avoid body stream issues
  const reqClone = opts.req.clone()
  const nextReq = new NextRequest(reqClone)
  const auth = getAuth(nextReq)
  const source = opts.req.headers.get('user-agent')

  console.log('>>> tRPC Request from', source, 'by', auth.userId ?? 'unknown')

  return {
    user: {
      id: auth.userId,
      role: auth.sessionClaims?.metadata.role,
    },
    session: auth.sessionId,
    db,
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
  return next({ ctx: { session: ctx.session, user: ctx.user } })
})

/**
 * this filters out queries and mutations that are only accessible to doctors
 */

const doctorMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  if (ctx.user.role !== 'specialist' && ctx.user.role !== 'admin')
    throw new TRPCError({ code: 'FORBIDDEN' })
  return next({ ctx: { session: ctx.session, user: ctx.user } })
})

/**
 * this filters out queries and mutations that are only accessible to admins
 */

const adminMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' })
  return next({ ctx: { session: ctx.session, user: ctx.user } })
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
