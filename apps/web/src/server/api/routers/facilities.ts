import { createTRPCRouter, publicProcedure } from '../trpc'
import { z } from 'zod'
import { FacilityService } from '@web/server/services/facilities'

export const facilitiesRouter = createTRPCRouter({
  registerFacility: publicProcedure
    .input(z.object({ placeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return FacilityService.register(ctx, input.placeId)
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
      return FacilityService.findNearby(input.location, input.searchRadius)
    }),
})
