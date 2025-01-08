'use client'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { TRPCReactProvider } from '@web/trpc/react'
import { ThemeProvider } from './theme-provider'

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TRPCReactProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </TRPCReactProvider>
    </ThemeProvider>
  )
}
