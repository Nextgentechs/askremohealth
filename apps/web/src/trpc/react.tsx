'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import SuperJSON from 'superjson'

import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { type APIRouter } from '@web/server/api'
import { createQueryClient } from './query-client'

export const api = createTRPCReact<APIRouter>()

export type RouterInputs = inferRouterInputs<APIRouter>
export type RouterOutputs = inferRouterOutputs<APIRouter>

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON, // valid place in v10
          url:
            typeof window !== 'undefined'
              ? window.location.origin + '/api/trpc'
              : '/api/trpc',
          headers: () => {
            const headers = new Headers()
            headers.set('x-trpc-source', 'nextjs-react')
            return headers
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            })
          },
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  )
}
