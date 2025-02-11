import '@web/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import Provider from '@web/providers/provider'
import { Toaster } from '@web/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Ask Virtual Healthcare',
  description: 'Ask Virtual Healthcare',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  )
}
