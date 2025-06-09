import { publicProcedure } from '../trpc';
import { z } from 'zod';
import { OfficeLocation } from '../../services/office-locations';
import { Client } from '@googlemaps/google-maps-services-js';
import { env } from '@web/env';

const googleMapsClient = new Client({});

export const registerOfficeLocation = publicProcedure
  .input(z.object({ placeId: z.string() }))
  .mutation(async ({ input }) => {
    return OfficeLocation.register(input.placeId);
  });

export const findByLocation = publicProcedure
  .input(
    z.object({
      location: z.object({ lat: z.number(), lng: z.number() }),
      searchRadius: z.number().default(10000),
    }),
  )
  .query(async ({ input }) => {
    return OfficeLocation.findNearby(input.location, input.searchRadius);
  });

export const listOfficeLocations = publicProcedure.query(async () => {
  return OfficeLocation.list();
});

export const searchOfficeLocationsByName = publicProcedure
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
      });

      const suggestions = response.data.predictions.map((prediction) => ({
        placeId: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.structured_formatting.secondary_text ?? undefined,
      }));

      return suggestions;
    } catch (error) {
      console.error('Error searching office locations by name:', error);
      throw new Error('Failed to search office locations');
    }
  }); 