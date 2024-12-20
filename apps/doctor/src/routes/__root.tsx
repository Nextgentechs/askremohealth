import { trpcQueryUtils } from '@/lib/trpc'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/components/ui/toaster'
import { Suspense } from 'react'
import LinearProgressBar from '@/components/linear-progress'
import { createRootRouteWithContext } from '@tanstack/react-router'
import { ProgressBar } from '@/components/progress-bar'
import { ThemeProvider } from '@/context/theme-provider'

export interface RouterAppContext {
  trpcQueryUtils: typeof trpcQueryUtils
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Suspense fallback={<LinearProgressBar />}>
        <ProgressBar />
        <Outlet />
        <Toaster />
        <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
      </Suspense>
    </ThemeProvider>
  )
}
