import { trpcQueryUtils } from '@/lib/trpc'
import { Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/toaster'
import React, { Suspense } from 'react'
import LinearProgressBar from '@/components/linear-progress'
import { createRootRouteWithContext } from '@tanstack/react-router'
import { ProgressBar } from '@/components/progress-bar'
import { ThemeProvider } from '@/context/theme-provider'

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      )

export interface RouterAppContext {
  trpcQueryUtils: typeof trpcQueryUtils
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  pendingComponent: () => <LinearProgressBar />,
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
