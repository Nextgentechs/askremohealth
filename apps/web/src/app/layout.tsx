import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import Provider from '~/providers/provider'
import Footer from '~/components/footer'
import NavigationBar from '~/components/navigation-bar'

export const metadata: Metadata = {
  title: 'Ask Virtual Healthcare',
  description: 'Ask Virtual Healthcare',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Provider>
          <div className="px-4 pt-2 transition-all duration-300 sm:px-6 max-w-[1440px] mx-auto sm:pt-4 lg:px-8 lg:pt-6 xl:px-16">
            <NavigationBar />
          </div>
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  )
}
