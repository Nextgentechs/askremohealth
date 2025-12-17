import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { headers } from 'next/headers'
import { appRouter } from 'src/server/api'
import { createTRPCContext } from 'src/server/api/trpc'

/**
 * Allowed origins for CORS
 * In production, only allow requests from our domains
 */
const ALLOWED_ORIGINS = [
  'https://askremohealth.com',
  'https://www.askremohealth.com',
  'https://doctors.askremohealth.com',
  // Development origins
  ...(process.env.NODE_ENV === 'development'
    ? [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://doctors.localhost:3000',
      ]
    : []),
]

async function setCorsHeaders(res: Response): Promise<boolean> {
  const origin = (await headers()).get('Origin')

  // Check if origin is allowed
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)

  if (isAllowedOrigin) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Request-Method', '*')
    res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
    res.headers.set('Access-Control-Allow-Headers', 'content-type')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    return true
  }

  // For same-origin requests (no Origin header), allow the request
  if (!origin) {
    return true
  }

  // Origin not allowed
  return false
}

export async function OPTIONS() {
  const response = new Response(null, { status: 204 })
  const allowed = await setCorsHeaders(response)
  if (!allowed) {
    return new Response('CORS origin not allowed', { status: 403 })
  }
  return response
}

async function handler(req: Request) {
  // Check CORS before processing
  const headersObj = await headers()
  const origin = headersObj.get('Origin')
  const isAllowedOrigin = !origin || ALLOWED_ORIGINS.includes(origin)

  if (!isAllowedOrigin) {
    return new Response('CORS origin not allowed', { status: 403 })
  }

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
