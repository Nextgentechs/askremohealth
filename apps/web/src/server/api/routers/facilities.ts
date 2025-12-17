import { Client } from '@googlemaps/google-maps-services-js'
import { env } from '@web/env'
import { Facility } from '@web/server/services/facilities'
import { z } from 'zod'
import { publicProcedure } from '../trpc'

const googleMapsClient = new Client({})

export const registerFacility = publicProcedure
  .input(z.object({ placeId: z.string() }))
  .mutation(async ({ input }) => {
    return Facility.register(input.placeId)
  })

export const findByLocation = publicProcedure
  .input(
    z.object({
      location: z.object({ lat: z.number(), lng: z.number() }),
      searchRadius: z.number().default(10000),
    }),
  )
  .query(async ({ input }) => {
    return Facility.findNearby(input.location, input.searchRadius)
  })

export const listFacilities = publicProcedure
  .input(
    z
      .object({
        type: z.string().optional(),
        county: z.string().optional(),
        search: z.string().optional(),
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(12),
      })
      .optional(),
  )
  .query(async ({ input }) => {
    return Facility.list(input)
  })

export const searchFacilitiesByName = publicProcedure
  .input(
    z.object({
      query: z.string().min(1),
    }),
  )
  .query(async ({ input }) => {
    try {
      const response = await googleMapsClient.placeAutocomplete({
        params: {
          input: input.query,
          components: ['country:KE'],
          key: env.GOOGLE_MAPS_API_KEY,
        },
      })

      const suggestions = response.data.predictions.map((prediction) => ({
        placeId: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.structured_formatting.secondary_text ?? undefined,
      }))

      return suggestions
    } catch (error) {
      console.error('Error searching facilities by name:', error)
      throw new Error('Failed to search facilities')
    }
  })
