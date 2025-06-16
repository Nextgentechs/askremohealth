import { NextResponse, NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  // Check if the request is for the doctors subdomain
  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  
  // If it's the doctors subdomain and we're not already on the specialist path
  if (isDoctorsSubdomain && !pathname.startsWith('/specialist')) {
    // Remove any leading slashes and add /specialist
    const cleanPath = pathname.replace(/^\/+/, '')
    const newUrl = new URL(`/specialist/${cleanPath}`, req.url)
    return NextResponse.redirect(newUrl)
  }

  // If we're on the specialist path but not on the doctors subdomain
  if (pathname.startsWith('/specialist') && !isDoctorsSubdomain) {
    const newUrl = new URL(pathname, `https://doctors.${hostname}`)
    return NextResponse.redirect(newUrl)
  }

  const isAdminRoute = pathname.startsWith('/admin')

  if (!sessionId && isAdminRoute) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
