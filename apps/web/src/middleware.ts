import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname // e.g. "/adminAuth" or "/admin/doctors"
  const hostname = req.headers.get('host') ?? ''

  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  // Public paths - adminAuth is a public auth page
  const publicPaths = ['/', '/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // helper for cookie options when copying across domains
  const cookieOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined,
  }

  // ---------- ADMIN SUBDOMAIN BEHAVIOR ----------
  // if we're on admin.askremohealth.com, serve admin pages
  if (isAdminSubdomain) {
    const adminHost =
      process.env.NODE_ENV === 'production' ? 'admin.askremohealth.com' : 'admin.localhost'

    // Admin root: pick landing - either auth (no session) or dashboard (session)
    if (pathname === '/') {
      if (!sessionId) {
        // rewrite so admin host serves the admin auth page (/adminAuth)
        // rewrite keeps the hostname as admin.askremohealth.com
        return NextResponse.rewrite(new URL('/adminAuth', `https://${adminHost}`))
      } else {
        return NextResponse.redirect(new URL('/admin/doctors', `https://${adminHost}`))
      }
    }

    // If visiting the admin auth page on the admin host and the user already has a session, redirect to dashboard
    if (pathname === '/adminAuth' && sessionId) {
      return NextResponse.redirect(new URL('/admin/doctors', `https://${adminHost}`))
    }

    // Protect admin pages (except public paths like /adminAuth)
    if (!sessionId && !isPublic) {
      // redirect to adminAuth on the same host
      return NextResponse.redirect(new URL('/adminAuth', `https://${adminHost}`))
    }

    // If a request on admin host is not under /admin and not public, rewrite to /admin/<path>
    if (!isPublic && !pathname.startsWith('/admin') && pathname !== '/adminAuth') {
      const cleanPath = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(new URL(`/admin/${cleanPath}`, `https://${adminHost}`))
    }

    // allow the request to proceed (auth page or allowed admin path)
    return NextResponse.next()
  }

  // If the request is to the adminAuth path on the MAIN hostname (askremohealth.com),
  // redirect to admin subdomain so admins use admin.askremohealth.com/adminAuth
  if (pathname === '/adminAuth' && !isAdminSubdomain) {
    const adminHost =
      process.env.NODE_ENV === 'production' ? 'admin.askremohealth.com' : 'admin.localhost'
    return NextResponse.redirect(new URL('/adminAuth', `https://${adminHost}`))
  }

  // If the request is an /admin route on MAIN domain, redirect to admin subdomain and copy session cookie (if present)
  if (isAdminRoute && !isAdminSubdomain) {
    const adminHost =
      process.env.NODE_ENV === 'production' ? 'admin.askremohealth.com' : 'admin.localhost'
    const newUrl = new URL(pathname, `https://${adminHost}`)
    const response = NextResponse.redirect(newUrl)

    if (sessionId) {
      // copy cookie so admin subdomain and sibling subdomains can access it
      response.cookies.set('session-id', sessionId, cookieOptions)
    }

    return response
  }

  // ---------- DOCTORS SUBDOMAIN LOGIC ----------
  if (isDoctorsSubdomain) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/specialist/upcoming-appointments', req.url))
    }

    if (!sessionId && !isPublic) {
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }

    if (!isPublic && !pathname.startsWith('/specialist')) {
      const cleanPath = pathname.replace(/^\/+/, '')
      const newUrl = new URL(`/specialist/${cleanPath}`, req.url)
      return NextResponse.redirect(newUrl)
    }

    return NextResponse.next()
  }

  // If we're on a specialist path on main domain, redirect to doctors subdomain (copy cookie when present)
  if (isSpecialistRoute && !isDoctorsSubdomain) {
    const doctorsHost =
      process.env.NODE_ENV === 'production' ? 'doctors.askremohealth.com' : 'doctors.localhost'
    const newUrl = new URL(pathname, `https://${doctorsHost}`)
    const response = NextResponse.redirect(newUrl)

    if (sessionId) {
      response.cookies.set('session-id', sessionId, cookieOptions)
    }

    return response
  }

  // Default: allow the request on main domain
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
