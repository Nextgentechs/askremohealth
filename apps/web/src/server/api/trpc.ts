// server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { serialize } from 'cookie'
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"

export function createContext({ req, res }: CreateNextContextOptions) {
  return {
    req,
    res,
    cookies: {
      set: (key: string, value: string, options: any) => {
        // Multiple cookies? Merge headers carefully (handle multiple calls)
        const existing = res.getHeader("Set-Cookie")
        const cookie = serialize(key, value, options)
        if (!existing) {
          res.setHeader("Set-Cookie", cookie)
        } else if (Array.isArray(existing)) {
          res.setHeader("Set-Cookie", [...existing, cookie])
        } else {
          res.setHeader("Set-Cookie", [existing, cookie])
        }
      },
      get: (key: string) => {
        const cookies = req.headers.cookie
        if (!cookies) return undefined
        const parsed = Object.fromEntries(
          cookies.split("; ").map((c) => {
            const [k, v] = c.split("=")
            return [k, v]
          })
        )
        if (!parsed[key]) return undefined
        return { name: key, value: parsed[key] }
      },
      delete: (key: string) => {
        // Not fully needed for signIn but good to have
        const cookie = serialize(key, "", {
          maxAge: -1,
          path: "/",
        })
        const existing = res.getHeader("Set-Cookie")
        if (!existing) {
          res.setHeader("Set-Cookie", cookie)
        } else if (Array.isArray(existing)) {
          res.setHeader("Set-Cookie", [...existing, cookie])
        } else {
          res.setHeader("Set-Cookie", [existing, cookie])
        }
      },
    },
  }
}


/**
 * TRPC Initialization
 */
const t = initTRPC.context().create({
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
  return next({ ctx: { ...ctx, user: ctx.user, session: ctx.session } })
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
