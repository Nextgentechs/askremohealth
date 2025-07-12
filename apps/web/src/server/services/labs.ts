import { Client, AddressType } from '@googlemaps/google-maps-services-js'
import { env } from '@web/env'
import { labs } from '@web/server/db/schema'
import { db } from '@web/server/db'
import { KENYA_COUNTIES } from '../data/kenya-counties'

const googleMapsClient = new Client({})

export class LabsService {
  static async register(placeId: string, user_id: string, phone?: string) {
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
        (c) => c.name.toLowerCase() === countyName.toLowerCase()
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
          Math.abs(c.coordinates.lng - lng) < 1
      )
      if (matchedCounty) {
        county = matchedCounty.name
      }
    }

    const [lab] = await db
      .insert(labs)
      .values({
        placeId,
        user_id,
        name: place.name ?? '',
        location: place.geometry?.location ?? null,
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
}
