import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { createCallerFactory, createTRPCRouter } from './trpc'
import * as specialties from './routers/specialties'
import * as facilities from './routers/facilities'
import * as users from './routers/users'
import * as locations from './routers/location'
import * as doctors from './routers/doctors'
import * as video from './routers/video'
import * as admin from './routers/admin'
import * as auth from './routers/auth'
import * as officeLocations from './routers/office-locations'
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  specialties: createTRPCRouter(specialties),
  facilities: createTRPCRouter(facilities),
  users: createTRPCRouter(users),
  locations: createTRPCRouter(locations),
  doctors: createTRPCRouter(doctors),
  video: createTRPCRouter(video),
  admin: createTRPCRouter(admin),
  auth: createTRPCRouter(auth),
  officeLocations: createTRPCRouter(officeLocations),
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
