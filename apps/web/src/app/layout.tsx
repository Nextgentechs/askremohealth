import '@web/styles/globals.css'

import { JsonLd } from '@web/components/json-ld'
import { SkipToMain } from '@web/components/skip-to-main'
import { Toaster } from '@web/components/ui/toaster'
import {
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
} from '@web/lib/structured-data'
import Provider from '@web/providers/provider'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://askremohealth.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Ask RemoHealth - Healthcare Solutions in Kenya',
    template: '%s | Ask RemoHealth',
  },
  description:
    'Solutions that help you and your loved ones enjoy Good Health and Long Life. Find doctors, hospitals, laboratories, and pharmacies near you.',
  keywords: [
    'healthcare',
    'doctors',
    'hospitals',
    'Kenya',
    'medical',
    'health',
    'telemedicine',
    'appointments',
    'specialists',
    'laboratories',
    'pharmacies',
  ],
  authors: [{ name: 'Ask RemoHealth' }],
  creator: 'Ask RemoHealth',
  publisher: 'Ask RemoHealth',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: BASE_URL,
    siteName: 'Ask RemoHealth',
    title: 'Ask RemoHealth - Healthcare Solutions in Kenya',
    description:
      'Solutions that help you and your loved ones enjoy Good Health and Long Life. Find doctors, hospitals, laboratories, and pharmacies near you.',
    images: [
      {
        url: `${BASE_URL}/assets/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Ask RemoHealth - Healthcare Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask RemoHealth - Healthcare Solutions in Kenya',
    description:
      'Solutions that help you and your loved ones enjoy Good Health and Long Life.',
    images: [`${BASE_URL}/assets/og-image.png`],
    creator: '@askremohealth',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <head>
        <JsonLd data={generateOrganizationJsonLd()} />
        <JsonLd data={generateWebsiteJsonLd()} />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Provider>
          <SkipToMain />
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  )
}
