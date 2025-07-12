import { publicProcedure } from '../trpc';
import { z } from 'zod';
import { LabsService } from '../../services/labs';
import { Client } from '@googlemaps/google-maps-services-js';
import { env } from '@web/env';

const googleMapsClient = new Client({});

export const registerLab = publicProcedure
  .input(z.object({ placeId: z.string(), user_id: z.string(), phone: z.string().optional() }))
  .mutation(async ({ input }) => {
    return LabsService.register(input.placeId, input.user_id, input.phone);
  });

export const findLabsByLocation = publicProcedure
  .input(
    z.object({
      location: z.object({ lat: z.number(), lng: z.number() }),
      searchRadius: z.number().default(10000),
    }),
  )
  .query(async ({ input }) => {
    const response = await googleMapsClient.placesNearby({
      params: {
        location: input.location,
        radius: input.searchRadius,
        keyword: 'medical laboratory|lab',
        type: 'health',
        key: env.GOOGLE_MAPS_API_KEY,
      },
    });
    return response.data.results.map((place) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: place.geometry?.location,
    }));
  });

export const listLabs = publicProcedure.query(async () => {
  return LabsService.list();
});

export const searchLabsByName = publicProcedure
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
      console.error('Error searching labs by name:', error);
      throw new Error('Failed to search labs');
    }
  });

export const labs = {
  registerLab,
  findLabsByLocation,
  listLabs,
  searchLabsByName,
};
