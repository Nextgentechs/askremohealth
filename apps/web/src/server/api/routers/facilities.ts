import { createTRPCRouter, publicProcedure } from '../trpc'
import { z } from 'zod'
import { Facility } from '@web/server/services/facilities'

export const facilitiesRouter = createTRPCRouter({
  registerFacility: publicProcedure
    .input(z.object({ placeId: z.string() }))
    .mutation(async ({ input }) => {
      return Facility.register(input.placeId)
    }),

  findByLocation: publicProcedure
    .input(
      z.object({
        location: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
        searchRadius: z.number().default(10000),
      }),
    )
    .query(async ({ input }) => {
      return Facility.findNearby(input.location, input.searchRadius)
    }),
})
