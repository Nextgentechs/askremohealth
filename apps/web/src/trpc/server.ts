import 'server-only'

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { headers } from 'next/headers'
import { cache } from 'react'

import { createCaller, type APIRouter } from '@web/server/api'
import { createTRPCContext } from '@web/server/api/trpc'
import { createQueryClient } from './query-client'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = await headers()

  const cookieHeader = heads.get('cookie') ?? ''
  const userAgent = heads.get('user-agent') ?? ''

  const req = new Request('http://localhost', {
    headers: {
      cookie: cookieHeader,
      'user-agent': userAgent,
    },
  })

  return createTRPCContext({ req })
})


const getQueryClient = cache(createQueryClient)
const caller = createCaller(createContext)

export const { trpc: api, HydrateClient } = createHydrationHelpers<APIRouter>(
  caller,
  getQueryClient,
)
