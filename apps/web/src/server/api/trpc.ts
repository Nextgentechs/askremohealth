// server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { redisClient } from '@web/redis/redis'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { sessionSchema } from '../lib/session'


export async function createContext({ req }: FetchCreateContextFnOptions) {
  const cookieHeader = req.headers.get('cookie') ?? ''
  const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => {
    const [k, v] = c.trim().split('=')
    return [k, v]
  }))

  const sessionToken = cookies['session-id']

  let user = null

  if (sessionToken) {
    const rawSession = await redisClient.get(`session:${sessionToken}`)
    if (rawSession) {
      const parsed = sessionSchema.safeParse(JSON.parse(rawSession))
      if (parsed.success) {
        user = parsed.data
      }
    }
  }

  return {
    req,
    cookies: {
      get: (key: string) => {
        const value = cookies[key]
        return value ? { name: key, value } : undefined
      }
    },
    user,
  }
}


const t = initTRPC.context<typeof createContext>().create({
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

// Middleware
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, user: ctx.user, session: ctx.session } })
})

const isDoctor = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a doctor' })
  }
  return next({ ctx })
})

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user ) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not an admin' })
  }
  return next({ ctx })
})

// tRPC exports
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const procedure = t.procedure.use(isAuthed)
export const doctorProcedure = t.procedure.use(isDoctor)
export const adminProcedure = t.procedure.use(isAdmin)
export const createCallerFactory = t.createCallerFactory
