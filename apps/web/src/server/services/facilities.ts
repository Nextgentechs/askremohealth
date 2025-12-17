import { AddressType, Client } from '@googlemaps/google-maps-services-js'
import { env } from '@web/env'
import { db } from '@web/server/db'
import { facilities } from '@web/server/db/schema'
import { sql } from 'drizzle-orm'
import { KENYA_COUNTIES } from '../data/kenya-counties'

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

    // Extract county information
    let county = ''
    const countyComponent = addressComponents.find(
      (component) =>
        component.types.includes(AddressType.administrative_area_level_1) ||
        component.types.includes(AddressType.administrative_area_level_2),
    )

    if (countyComponent) {
      // Try to match with our known counties
      const countyName = countyComponent.long_name
        .replace(' County', '')
        .replace('Wilaya ya ', '')
        .replace('Kaunti ya ', '')
        .trim()

      const matchedCounty = KENYA_COUNTIES.find(
        (c) => c.name.toLowerCase() === countyName.toLowerCase(),
      )
      county = matchedCounty ? matchedCounty.name : countyName
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
      // This is a simple implementation - you might want to use a more sophisticated
      // geospatial query in a production environment
      const matchedCounty = KENYA_COUNTIES.find(
        (c) =>
          Math.abs(c.coordinates.lat - lat) < 1 &&
          Math.abs(c.coordinates.lng - lng) < 1,
      )
      if (matchedCounty) {
        county = matchedCounty.name
      }
    }

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
        verified: false,
        createdAt: new Date(),
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

  static async list(options?: {
    type?: string
    county?: string
    search?: string
    page?: number
    pageSize?: number
  }) {
    const { type, county, search, page = 1, pageSize = 12 } = options ?? {}
    const offset = (page - 1) * pageSize

    const baseConditions = []

    if (type) {
      baseConditions.push(sql`${facilities.type} = ${type}`)
    }
    if (county) {
      baseConditions.push(sql`${facilities.county} = ${county}`)
    }
    if (search) {
      baseConditions.push(
        sql`(${facilities.name} ILIKE ${`%${search}%`} OR ${facilities.address} ILIKE ${`%${search}%`})`,
      )
    }

    const whereClause =
      baseConditions.length > 0
        ? sql.join(baseConditions, sql` AND `)
        : undefined

    const [facilitiesList, countResult] = await Promise.all([
      db.query.facilities.findMany({
        where: whereClause ? () => whereClause : undefined,
        limit: pageSize,
        offset,
        orderBy: (f, { desc }) => [desc(f.createdAt)],
        with: {
          doctors: {
            columns: {
              id: true,
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(facilities)
        .where(whereClause ?? undefined),
    ])

    const total = countResult[0]?.count ?? 0

    return {
      facilities: facilitiesList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }
}
