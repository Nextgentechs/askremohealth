import { Client, AddressType } from '@googlemaps/google-maps-services-js'
import { env } from '@web/env'
import { officeLocation } from '@web/server/db/schema'
import { db } from '@web/server/db'
import { KENYA_COUNTIES } from '../data/kenya-counties'

const googleMapsClient = new Client({})

export class OfficeLocation {
  static async register(placeId: string) {
    const existingOffice = await db.query.officeLocation.findFirst({
      where: (o, { eq }) => eq(o.placeId, placeId),
    })

    if (existingOffice) {
      return existingOffice
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

    // Extract county information
    let county = ''
    const countyComponent = addressComponents.find(
      (component) =>
        component.types.includes(AddressType.administrative_area_level_1) ||
        component.types.includes(AddressType.administrative_area_level_2),
    )
    
    if (countyComponent) {
      // Try to match with our known counties
      const countyName = countyComponent.long_name.replace(' County', '')
      const matchedCounty = KENYA_COUNTIES.find(
        (c) => c.name.toLowerCase().includes(countyName.toLowerCase())
      )
      county = matchedCounty ? matchedCounty.name : countyComponent.long_name
    }

    // Extract town information
    let town = ''
    const townComponent = addressComponents.find(
      (component) =>
        component.types.includes(AddressType.locality) ||
        component.types.includes(AddressType.sublocality),
    )
    
    if (townComponent) {
      town = townComponent.long_name
    } else {
      // If no town is found, try to extract from formatted address
      const addressParts = place.formatted_address?.split(',') ?? []
      if (addressParts.length >= 2) {
        // Usually the second-to-last part contains the town
        town = addressParts[addressParts.length - 2]?.trim() ?? ''
      }
    }

    // If we still don't have a county, try to determine it from coordinates
    if (!county && place.geometry?.location) {
      const { lat, lng } = place.geometry.location
      // Find the county that contains these coordinates
      const matchedCounty = KENYA_COUNTIES.find(
        (c) =>
          Math.abs(c.coordinates.lat - lat) < 1 && 
          Math.abs(c.coordinates.lng - lng) < 1
      )
      if (matchedCounty) {
        county = matchedCounty.name
      }
    }

    const [office] = await db
      .insert(officeLocation)
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
        verified: false,
        createdAt: new Date(),
      })
      .returning()

    return office
  }

  static async findNearby(
    location: { lat: number; lng: number },
    radius: number,
  ) {
    const officePlaces = await googleMapsClient.placesNearby({
      params: {
        location,
        radius,
        type: 'office',
        key: env.GOOGLE_MAPS_API_KEY,
      },
    })

    const buildingPlaces = await googleMapsClient.placesNearby({
      params: {
        location,
        radius,
        keyword: 'building|commercial|business',
        type: 'establishment',
        key: env.GOOGLE_MAPS_API_KEY,
      },
    })

    const allPlaces = [
      ...officePlaces.data.results,
      ...buildingPlaces.data.results,
    ]

    const uniquePlaces = Array.from(
      new Map(allPlaces.map((place) => [place.place_id, place])).values(),
    )

    const officeTypes = new Set([
      'office',
      'establishment',
      'point_of_interest',
      'building',
      'commercial',
      'business',
    ])

    const filteredPlaces = uniquePlaces.filter((place) =>
      place?.types?.some((type) => officeTypes.has(type)),
    )

    return filteredPlaces.map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: place.geometry?.location,
      rating: place.rating ?? null,
      userRatingsTotal: place.user_ratings_total ?? 0,
      types: place?.types?.filter((type) => officeTypes.has(type)),
      openNow: place.opening_hours?.open_now,
      photos: place.photos?.map((photo) => photo.photo_reference),
    }))
  }

  static async list() {
    return db.query.officeLocation.findMany({
      with: {
        doctors: true,
      },
    })
  }
} 