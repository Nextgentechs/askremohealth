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
    const response = NextResponse.redirect(newUrl)

    // Copy session cookie to the new domain
    if (sessionId) {
      response.cookies.set('session-id', sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : '.localhost'
      })
    }

    const nextAuthToken = req.cookies.get('authjs.session-token')?.value;
    const nextAuthSecureToken = req.cookies.get('__Secure-authjs.session-token')?.value;

    if (nextAuthToken) {
      response.cookies.set('authjs.session-token', nextAuthToken, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : '.localhost'
      });
    }
    if (nextAuthSecureToken) {
      response.cookies.set('__Secure-authjs.session-token', nextAuthSecureToken, {
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : '.localhost'
      });
    }

    return response
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
