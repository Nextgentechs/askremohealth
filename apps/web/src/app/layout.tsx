import '@web/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import Provider from '@web/providers/provider'
import Footer from '@web/components/footer'
import NavigationBar from '@web/components/navigation-bar'
import { Toaster } from '@web/components/ui/toaster'
import { api } from '@web/trpc/server'

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
          <div className="mx-auto max-w-[1440px] px-4 pt-2 transition-all duration-300 sm:px-6 sm:pt-4 lg:px-8 lg:pt-6 xl:px-16">
            <NavigationBar />
          </div>
          {children}
          <Footer />
          <Toaster />
        </Provider>
      </body>
    </html>
  )
}
