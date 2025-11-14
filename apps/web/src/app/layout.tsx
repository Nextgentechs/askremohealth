import '@web/styles/globals.css'

import { Toaster } from '@web/components/ui/toaster'
import Provider from '@web/providers/provider'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import SuppressHydrationWarnings from './_components/SuppressHydrationWarnings'

export const metadata: Metadata = {
  title: 'Ask RemoHealth',
  description: 'Solutions that help you and your loved ones enjoy Good Health and Long Life',
  other: {
    "google-site-verification": "5wsLFd2dEya0OHetHbMQavV4kDqaYkDa4TM9sifwIiI",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground antialiased">
        {/* Only render client-dependent components after hydration */}
        <SuppressHydrationWarnings>
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </SuppressHydrationWarnings>
      </body>
    </html>
  )
}
