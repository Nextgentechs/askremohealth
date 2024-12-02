import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import Provider from '~/providers/provider'

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
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
