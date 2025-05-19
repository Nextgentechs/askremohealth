// server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { parse, serialize } from 'cookie'
import { db } from '../db'
import { getUserFromToken } from '../utils'

/**
 * CONTEXT (Edge-Compatible)
 *
 * Expects an object with:
 *  - req: Request (Fetch API Request)
 *  - resHeaders: Headers (mutable Headers object from response)
 */
export async function createTRPCContext(opts: { req: Request; resHeaders: Headers }) {
  const { req, resHeaders } = opts

  // Parse incoming cookies from request
  const cookieHeader = req.headers.get('cookie') ?? ''
  const parsedCookies = parse(cookieHeader)

  // Collect multiple Set-Cookie headers safely
  // Headers API doesn't allow multiple 'Set-Cookie' entries,
  // so we collect cookies in an array and set all at once after context is created.
  const setCookieArray: string[] = []

  const cookies = {
    get: (key: string) => {
      const value = parsedCookies[key]
      return value ? { name: key, value } : undefined
    },
    set: (
      key: string,
      value: string,
      options: {
        secure?: boolean
        httpOnly?: boolean
        sameSite?: 'strict' | 'lax'
        expires?: number
      } = {}
    ) => {
      const cookieStr = serialize(key, value, {
        path: '/',
        httpOnly: options.httpOnly ?? true,
        secure: options.secure ?? true,
        sameSite: options.sameSite ?? 'lax',
        expires: options.expires ? new Date(options.expires) : undefined,
      })
      setCookieArray.push(cookieStr)
    },
    delete: (key: string) => {
      const cookieStr = serialize(key, '', {
        path: '/',
        maxAge: 0,
      })
      setCookieArray.push(cookieStr)
    },
    // helper to apply collected cookies to response headers
    applyToHeaders: () => {
      if (setCookieArray.length === 0) return
      // Set all cookies by calling resHeaders.set multiple times is not allowed,
      // so we use resHeaders.append if available or join with \n (rarely supported)
      // Here we assume append is available:
      setCookieArray.forEach(cookie => {
        // Use resHeaders.append if available, otherwise fallback to set
        if (typeof resHeaders.append === 'function') {
          resHeaders.append('Set-Cookie', cookie)
        } else {
          // fallback: combine all cookies separated by newline (not standard but better than comma)
          const prev = resHeaders.get('Set-Cookie')
          if (prev) {
            resHeaders.set('Set-Cookie', prev + '\n' + cookie)
          } else {
            resHeaders.set('Set-Cookie', cookie)
          }
        }
      })
    },
  }

  const sessionToken = parsedCookies['session']
  const user = sessionToken ? await getUserFromToken(sessionToken) : null

  return {
    req,
    cookies,
    user,
    session: user ? { ...user } : null,
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
