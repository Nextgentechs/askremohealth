import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { authRouter } from './routers/auth'
import { createCallerFactory, createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
})

// export type definition of API
export type APIRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<APIRouter>
export type RouterOutputs = inferRouterOutputs<APIRouter>

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
