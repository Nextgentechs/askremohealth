import 'server-only'

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cache } from 'react'

import { createCaller, type APIRouter } from '@web/server/api'
import { createTRPCContext } from '@web/server/api/trpc'
import { createQueryClient } from './query-client'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  // For server components, we can directly call createTRPCContext without a request object
  // since we're not in an HTTP request context
  return createTRPCContext()
})

const getQueryClient = cache(createQueryClient)
const caller = createCaller(createContext)

export const { trpc: api, HydrateClient } = createHydrationHelpers<APIRouter>(
  caller,
  getQueryClient,
)
