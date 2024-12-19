import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { authRouter } from './routers/auth'
import { createCallerFactory, createTRPCRouter } from './trpc'
import { specialtiesRouter } from './routers/specialties'
import { facilitiesRouter } from './routers/facilities'
import { appointmentsRouter } from './routers/appointments'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  specialties: specialtiesRouter,
  facilities: facilitiesRouter,
  appointments: appointmentsRouter,
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
