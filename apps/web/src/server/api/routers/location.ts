import { createTRPCRouter, publicProcedure } from '../trpc'
import { KENYA_COUNTIES } from '@web/server/data/kenya-counties'
import { Client } from '@googlemaps/google-maps-services-js'
import { z } from 'zod'
import { env } from '@web/env'

const googleMapsClient = new Client({})

export const locationsRouter = createTRPCRouter({
  counties: publicProcedure.query(() => {
    return KENYA_COUNTIES.map((county) => ({
      name: county.name,
      code: county.code,
      location: county.coordinates,
    }))
  }),

  towns: publicProcedure
    .input(
      z.object({
        countyCode: z.string().length(3).optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.countyCode) {
        return []
      }

      const county = KENYA_COUNTIES.find((c) => c.code === input.countyCode)
      if (!county) {
        throw new Error(`County not found for code: ${input.countyCode}`)
      }

      try {
        const response = await googleMapsClient.textSearch({
          params: {
            query: `areas neighborhoods suburbs in ${county.name} county kenya`,
            location: county.coordinates,
            radius: 30000,
            key: env.GOOGLE_MAPS_API_KEY,
          },
        })

        const places = response.data.results.map((place) => ({
          id: place.place_id,
          name: place.name
            ?.replace(' Area', '')
            .replace(', Kenya', '')
            .replace(` ${county.name}`, '')
            .trim(),
          location: place.geometry?.location,
          countyCode: input.countyCode,
        }))

        const uniquePlaces = Array.from(
          new Map(places.map((place) => [place.name, place])).values(),
        )

        return uniquePlaces.sort(
          (a, b) => a.name?.localeCompare(b.name ?? '') ?? 0,
        )
      } catch (error) {
        console.error(`Error fetching towns for ${county.name}:`, error)
        throw new Error(`Failed to fetch towns for ${county.name}`)
      }
    }),
})
