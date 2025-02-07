import '@web/styles/globals.css'

import { Toaster } from '@web/components/ui/toaster'
import Provider from '@web/providers/provider'
import React from 'react'
import { GeistSans } from 'geist/font/sans'
export default function layout({ children }: { children: React.ReactNode }) {
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
