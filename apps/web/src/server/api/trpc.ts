// server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { parse } from 'cookie'
import { db } from '../db'
import { getUserFromToken } from '../utils'

/**
 * CONTEXT (Edge-Compatible)
 */
export async function createTRPCContext(opts: { req: Request }) {
  const { req } = opts

  const cookieHeader = req.headers.get("cookie") ?? ""
  const parsedCookies = parse(cookieHeader)
  const sessionToken = parsedCookies['session']
  const user = sessionToken ? await getUserFromToken(sessionToken) : null

  const cookies = {
    get: (key: string) => {
      const value = parsedCookies[key]
      return value ? { name: key, value } : undefined
    },
    set: (_key: string, _value: string, _options: any) => {
      console.warn("Set cookie not supported in Edge runtime.")
    },
    delete: (_key: string) => {
      console.warn("Delete cookie not supported in Edge runtime.")
    },
  }

  return {
    req,
    cookies,
    user,
    session: user ? { ...user.sessionData } : null,
    db,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

/**
 * TRPC Initialization
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
 * Middleware and Procedures
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { user: ctx.user, session: ctx.session } })
})

const isDoctor = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'doctor') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a doctor' })
  }
  return next({ ctx })
})

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not an admin' })
  }
  return next({ ctx })
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const procedure = t.procedure.use(isAuthed)
export const doctorProcedure = t.procedure.use(isDoctor)
export const adminProcedure = t.procedure.use(isAdmin)
export const createCallerFactory = t.createCallerFactory
