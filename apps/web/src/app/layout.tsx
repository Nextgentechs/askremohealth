import '@web/styles/globals.css'

import { Toaster } from '@web/components/ui/toaster'
import Provider from '@web/providers/provider'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ask RemoHealth',
  description: 'Solutions that help you and your loved ones enjoy Good Health and Long Life',
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
