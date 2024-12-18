import { trpcQueryUtils } from '@/lib/trpc'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/components/ui/toaster'
import { Suspense } from 'react'
import LinearProgressBar from '@/components/linear-progress'

export interface RouterAppContext {
  trpcQueryUtils: typeof trpcQueryUtils
}

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <Suspense fallback={<LinearProgressBar />}>
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools position="bottom-right" />
    </Suspense>
  )
}
