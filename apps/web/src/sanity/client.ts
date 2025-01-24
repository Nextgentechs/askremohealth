import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { type SanityImageSource } from '@sanity/image-url/lib/types/types'

export const client = createClient({
  projectId: 'aazj2t9c',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
