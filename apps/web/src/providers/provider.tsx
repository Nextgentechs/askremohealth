'use client'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { TRPCReactProvider } from '@web/trpc/react'
import { ThemeProvider } from './theme-provider'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TRPCReactProvider>
        <ProgressBar
          height="2px"
          color="hsl(254, 46.2%, 33.5%)"
          options={{ showSpinner: false }}
          shallowRouting
        />
        <NuqsAdapter>{children}</NuqsAdapter>
      </TRPCReactProvider>
    </ThemeProvider>
  )
}
