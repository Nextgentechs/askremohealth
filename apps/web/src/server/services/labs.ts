import { AddressType, Client } from '@googlemaps/google-maps-services-js'
import { env } from '@web/env'
import { db } from '@web/server/db'
import { labs } from '@web/server/db/schema'
import { KENYA_COUNTIES } from '../data/kenya-counties'

const googleMapsClient = new Client({})

export class LabsService {
  static async register(placeId: string, userId: string, phone?: string) {
    const existingLab = await db.query.labs.findFirst({
      where: (l, { eq }) => eq(l.placeId, placeId),
    })

    if (existingLab) {
      return existingLab
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
    const addressComponents = place.address_components ?? []

    // Extract county information
    let county = ''
    const countyComponent = addressComponents.find(
      (component) =>
        component.types.includes(AddressType.administrative_area_level_1) ||
        component.types.includes(AddressType.administrative_area_level_2),
    )
    if (countyComponent) {
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
      const addressParts = place.formatted_address?.split(',') ?? []
      if (addressParts.length >= 2) {
        town = addressParts[addressParts.length - 2]?.trim() ?? ''
      }
    }

    if (!county && place.geometry?.location) {
      const { lat, lng } = place.geometry.location
      const matchedCounty = KENYA_COUNTIES.find(
        (c) =>
          Math.abs(c.coordinates.lat - lat) < 1 &&
          Math.abs(c.coordinates.lng - lng) < 1,
      )
      if (matchedCounty) {
        county = matchedCounty.name
      }
    }

    const [lab] = await db
      .insert(labs)
      .values({
        placeId,
        userId,
        name: place.name ?? '',
        // location: place.geometry?.location ?? null, // Removed as it is not in schema
        address: place.formatted_address ?? '',
        county,
        town,
        phone: phone ?? place.formatted_phone_number ?? null,
        website: place.website,
      })
      .returning()

    return lab
  }

  // Optionally, add a method to list labs
  static async list() {
    return db.query.labs.findMany()
  }

  // Add: listFiltered for server-side filtering
  static async listFiltered({
    name,
    county,
  }: {
    name?: string
    county?: string
  }) {
    return db.query.labs.findMany({
      where: (lab, { ilike, and, eq }) => {
        const conditions = []
        if (name) {
          conditions.push(ilike(lab.name, `%${name}%`))
        }
        if (county) {
          conditions.push(eq(lab.county, county))
        }
        return conditions.length ? and(...conditions) : undefined
      },
    })
  }

  static async getById(placeId: string) {
    return db.query.labs.findFirst({
      where: (l, { eq }) => eq(l.placeId, placeId),
    })
  }

  static async getTestsByLabId(labId: string) {
    // Join labTestsAvailable with tests to get test name and details
    return db.query.labTestsAvailable.findMany({
      where: (lta, { eq }) => eq(lta.labId, labId),
      with: {
        test: true, // assumes a relation is set up in drizzle schema
      },
    })
  }

  static async getAvailabilityByLabId(labId: string) {
    return db.query.labAvailability.findMany({
      where: (la, { eq }) => eq(la.labId, labId),
    })
  }
}
