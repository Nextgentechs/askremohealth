// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from 'src/server/api'
import { createContext } from 'src/server/api/trpc'

export const runtime = 'nodejs'

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`)
    },
  })
}

export { handler as GET, handler as POST }

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
