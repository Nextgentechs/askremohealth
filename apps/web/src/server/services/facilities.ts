import { Client, AddressType } from '@googlemaps/google-maps-services-js'
import { env } from '@web/env'
import { facilities } from '@web/server/db/schema'
import { db } from '@web/server/db'

const googleMapsClient = new Client({})

export class Facility {
  static async register(placeId: string) {
    const existingFacility = await db.query.facilities.findFirst({
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
          'types',
        ],
        key: env.GOOGLE_MAPS_API_KEY,
      },
    })

    const place = details.data.result

    const type = place.types?.[0] ?? null

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

    const [facility] = await db
      .insert(facilities)
      .values({
        name: place.name ?? '',
        placeId,
        type,
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
    const hospitalPlaces = await googleMapsClient.placesNearby({
      params: {
        location,
        radius,
        type: 'hospital',
        key: env.GOOGLE_MAPS_API_KEY,
      },
    })

    const healthPlaces = await googleMapsClient.placesNearby({
      params: {
        location,
        radius,
        keyword: 'clinic|medical center|laboratory|health center',
        type: 'health',
        key: env.GOOGLE_MAPS_API_KEY,
      },
    })

    const allPlaces = [
      ...hospitalPlaces.data.results,
      ...healthPlaces.data.results,
    ]

    const uniquePlaces = Array.from(
      new Map(allPlaces.map((place) => [place.place_id, place])).values(),
    )

    const healthcareTypes = new Set([
      'hospital',
      'doctor',
      'health',
      'clinic',
      'medical_clinic',
      'dentist',
      'physiotherapist',
      'pharmacy',
      'laboratory',
      'medical_office',
      'healthcare',
    ])

    const filteredPlaces = uniquePlaces.filter((place) =>
      place?.types?.some((type) => healthcareTypes.has(type)),
    )

    return filteredPlaces.map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: place.geometry?.location,
      rating: place.rating ?? null,
      userRatingsTotal: place.user_ratings_total ?? 0,
      types: place?.types?.filter((type) => healthcareTypes.has(type)),
      openNow: place.opening_hours?.open_now,
      photos: place.photos?.map((photo) => photo.photo_reference),
    }))
  }

  static async list() {
    return db.query.facilities.findMany({
      with: {
        doctors: true,
      },
    })
  }
}
