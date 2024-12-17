import type { APIRouter } from '@web/server/api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import {
  createTRPCQueryUtils,
  createTRPCReact,
  httpBatchLink,
  httpLink,
  Operation,
  splitLink,
} from '@trpc/react-query'
import superjson from 'superjson'
import { routeTree } from '@/routeTree.gen'
export type { RouterInputs, RouterOutputs } from '@web/server/api'

function getApiUrl(pathname: string) {
  const url = new URL(import.meta.env.VITE_PUBLIC_API_URL!)
  url.pathname = pathname
  return url.toString()
}

export const queryClient = new QueryClient()

export const api = createTRPCReact<APIRouter>({ abortOnUnmount: true })

const options = {
  url: getApiUrl('/api/trpc'),
  fetch(url: string | URL | Request, options: RequestInit | undefined) {
    return fetch(url, { ...options, credentials: 'include' })
  },
  transformer: superjson,
}
export const trpcClient = api.createClient({
  links: [
    splitLink({
      condition: (op: Operation) => op.context.skipBatch === true,
      true: httpLink(options),
      false: httpBatchLink(options),
    }),
  ],
})

export const trpcQueryUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
})

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    context: { trpcQueryUtils },
    Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
      return (
        <api.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </api.Provider>
      )
    },
  })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
