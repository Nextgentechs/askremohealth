import { db } from '@web/server/db'
import { articles, doctors, facilities } from '@web/server/db/schema'
import { isNotNull } from 'drizzle-orm'
import { type MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://askremohealth.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/find-specialists`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/hospitals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/laboratories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pharmacies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic doctor pages
  const doctorsList = await db
    .select({ id: doctors.id, updatedAt: doctors.updatedAt })
    .from(doctors)
    .where(isNotNull(doctors.userId))

  const doctorPages: MetadataRoute.Sitemap = doctorsList.map((doctor) => ({
    url: `${BASE_URL}/find-specialists/${doctor.id}`,
    lastModified: doctor.updatedAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic facility pages - use placeId as identifier and createdAt for lastModified
  const facilitiesList = await db
    .select({ placeId: facilities.placeId, createdAt: facilities.createdAt })
    .from(facilities)

  const facilityPages: MetadataRoute.Sitemap = facilitiesList.map(
    (facility) => ({
      url: `${BASE_URL}/facilities/${facility.placeId}`,
      lastModified: facility.createdAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }),
  )

  // Dynamic article pages - use publishedAt as filter (not null = published)
  const articlesList = await db
    .select({ id: articles.id, updatedAt: articles.updatedAt })
    .from(articles)
    .where(isNotNull(articles.publishedAt))

  const articlePages: MetadataRoute.Sitemap = articlesList.map((article) => ({
    url: `${BASE_URL}/articles/${article.id}`,
    lastModified: article.updatedAt ?? new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...doctorPages, ...facilityPages, ...articlePages]
}
