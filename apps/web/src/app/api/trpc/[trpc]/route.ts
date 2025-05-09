import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from 'src/server/api'
import { createTRPCContext } from 'src/server/api/trpc'

export const runtime = 'edge' // Optional: only if you're using the edge runtime

async function handler(req: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError({ error, path }) {
      console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`)
    },
  })
}

export const GET = handler
export const POST = handler

// Optional CORS preflight handler if calling tRPC from another domain
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
