'use client'

import { TRPCReactProvider } from '~/trpc/react'
import { ThemeProvider } from './theme-provider'

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </ThemeProvider>
  )
}
