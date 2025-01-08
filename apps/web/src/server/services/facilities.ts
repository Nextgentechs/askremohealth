import { Client, AddressType } from '@googlemaps/google-maps-services-js'
import { env } from '@web/env'
import { facilities } from '@web/server/db/schema'
import { type Context } from '../api/trpc'

const googleMapsClient = new Client({})

export class FacilityService {
  static async register(ctx: Context, placeId: string) {
    const existingFacility = await ctx.db.query.facilities.findFirst({
      where: (f, { eq }) => eq(f.placeId, placeId),
    })

    if (existingFacility) {
      return existingFacility
    }

    const details = await googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          'name',
          'formatted_address',
          'geometry',
          'formatted_phone_number',
          'website',
          'address_components',
        ],
        key: env.GOOGLE_MAPS_API_KEY,
      },
    })

    const place = details.data.result
    const addressComponents = place.address_components ?? []

    const county =
      addressComponents.find(
        (component) =>
          component.types.includes(AddressType.administrative_area_level_1) ||
          component.types.includes(AddressType.administrative_area_level_2),
      )?.long_name ?? ''

    const town =
      addressComponents.find(
        (component) =>
          component.types.includes(AddressType.locality) ||
          component.types.includes(AddressType.sublocality),
      )?.long_name ?? ''

    const [facility] = await ctx.db
      .insert(facilities)
      .values({
        name: place.name ?? '',
        placeId,
        location: place.geometry?.location ?? null,
        address: place.formatted_address ?? '',
        county,
        town,
        phone: place.formatted_phone_number,
        website: place.website,
      })
      .returning()

    return facility
  }

  static async findNearby(
    location: { lat: number; lng: number },
    radius: number,
  ) {
    const nearbyPlaces = await googleMapsClient.placesNearby({
      params: {
        location,
        radius,
        type: 'health',
        key: env.GOOGLE_MAPS_API_KEY,
      },
    })

    return nearbyPlaces.data.results.map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: place.geometry?.location,
      rating: place.rating ?? null,
      userRatingsTotal: place.user_ratings_total ?? 0,
      types: place.types,
      openNow: place.opening_hours?.open_now,
      photos: place.photos?.map((photo) => photo.photo_reference),
    }))
  }
}
