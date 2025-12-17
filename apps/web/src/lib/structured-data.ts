/**
 * JSON-LD Structured Data Helpers
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://askremohealth.com'

export interface DoctorStructuredData {
  id: string
  firstName: string | null | undefined
  lastName: string | null | undefined
  specialization: string | null | undefined
  bio: string | null | undefined
  profilePicture?: { url: string | null } | null
  locations?: Array<{
    name: string | null
    county: string | null
    address: string | null
  }> | null
  reviewStats?: {
    averageRating: number
    totalReviews: number
  }
}

export function generateDoctorJsonLd(doctor: DoctorStructuredData) {
  const name = `Dr. ${doctor.firstName ?? ''} ${doctor.lastName ?? ''}`.trim()
  const location = doctor.locations?.[0]

  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `${BASE_URL}/find-specialists/${doctor.id}`,
    name,
    description:
      doctor.bio ?? `${name} is a healthcare specialist at Ask RemoHealth`,
    image: doctor.profilePicture?.url ?? undefined,
    medicalSpecialty: doctor.specialization ?? undefined,
    url: `${BASE_URL}/find-specialists/${doctor.id}`,
    ...(location && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address ?? undefined,
        addressLocality: location.name ?? undefined,
        addressRegion: location.county ?? undefined,
        addressCountry: 'KE',
      },
    }),
    ...(doctor.reviewStats &&
      doctor.reviewStats.totalReviews > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: doctor.reviewStats.averageRating.toFixed(1),
          reviewCount: doctor.reviewStats.totalReviews,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    isAcceptingNewPatients: true,
    availableService: {
      '@type': 'MedicalTherapy',
      name: 'Medical Consultation',
    },
  }
}

export interface FacilityStructuredData {
  id: string
  name: string | null
  type: 'hospital' | 'laboratory' | 'pharmacy' | null
  county: string | null
  address: string | null
  phone: string | null
  email: string | null
}

export function generateFacilityJsonLd(facility: FacilityStructuredData) {
  const typeMap = {
    hospital: 'Hospital',
    laboratory: 'DiagnosticLab',
    pharmacy: 'Pharmacy',
  } as const

  const schemaType = facility.type ? typeMap[facility.type] : 'MedicalClinic'

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${BASE_URL}/facilities/${facility.id}`,
    name: facility.name,
    url: `${BASE_URL}/facilities/${facility.id}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: facility.address ?? undefined,
      addressRegion: facility.county ?? undefined,
      addressCountry: 'KE',
    },
    ...(facility.phone && {
      telephone: facility.phone,
    }),
    ...(facility.email && {
      email: facility.email,
    }),
  }
}

export interface ArticleStructuredData {
  id: string
  title: string | null
  content: string | null
  author: string | null
  publishedAt: Date | null
  updatedAt: Date | null
  imageUrl: string | null
}

export function generateArticleJsonLd(article: ArticleStructuredData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${BASE_URL}/articles/${article.id}`,
    headline: article.title,
    description: article.content?.slice(0, 160) ?? undefined,
    image: article.imageUrl ?? undefined,
    datePublished: article.publishedAt?.toISOString() ?? undefined,
    dateModified: article.updatedAt?.toISOString() ?? undefined,
    author: {
      '@type': 'Organization',
      name: article.author ?? 'Ask RemoHealth',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ask RemoHealth',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/assets/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/articles/${article.id}`,
    },
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': BASE_URL,
    name: 'Ask RemoHealth',
    description:
      'Solutions that help you and your loved ones enjoy Good Health and Long Life',
    url: BASE_URL,
    logo: `${BASE_URL}/assets/logo.png`,
    sameAs: [
      'https://twitter.com/askremohealth',
      'https://facebook.com/askremohealth',
      'https://linkedin.com/company/askremohealth',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@askremohealth.com',
      availableLanguage: ['English', 'Swahili'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KE',
    },
    medicalSpecialty: [
      'General Practice',
      'Cardiology',
      'Dermatology',
      'Pediatrics',
      'Gynecology',
      'Orthopedics',
    ],
  }
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Ask RemoHealth',
    description:
      'Solutions that help you and your loved ones enjoy Good Health and Long Life',
    publisher: {
      '@type': 'Organization',
      name: 'Ask RemoHealth',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/find-specialists?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
