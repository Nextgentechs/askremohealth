import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { headers } from 'next/headers'
import { appRouter } from 'src/server/api'
import { createTRPCContext } from 'src/server/api/trpc'

async function setCorsHeaders(res: Response) {
  const origin = (await headers()).get('Origin')
  res.headers.set('Access-Control-Allow-Origin', origin ?? '*')
  res.headers.set('Access-Control-Request-Method', '*')
  res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
  res.headers.set('Access-Control-Allow-Headers', 'content-type')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
}

export async function OPTIONS() {
  const response = new Response(null, { status: 204 })
  await setCorsHeaders(response)
  return response
}

async function handler(req: Request) {
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: (opts) => createTRPCContext(opts),
    onError({ error, path }) {
      console.error(
        `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
      )
    },
  })
  await setCorsHeaders(response)
  return response
}

export const GET = handler
export const POST = handler