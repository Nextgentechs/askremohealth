import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  // Subdomain detection
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isDoctorsSubdomain = hostname.startsWith('doctors.')

  // Route-type detection
  const isAdminRoute = pathname.startsWith('/admin')
  const isSpecialistRoute = pathname.startsWith('/specialist')

  // Domain environment
  const isProduction =
    hostname === 'askremohealth.com' || hostname === 'www.askremohealth.com'

  const isStaging = hostname.includes('staging.askremohealth.com')

  // Public pages (not protected)
  const publicPaths = ['/', '/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  // -----------------------------
  // ADMIN SUBDOMAIN (admin.askremohealth.com)
  // -----------------------------
  if (isAdminSubdomain) {
    // Root → /adminAuth
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/adminAuth', req.url))
    }

    // Auth page but already logged in
    if (pathname === '/adminAuth' && sessionId) {
      return NextResponse.redirect(new URL('/admin/doctors', req.url))
    }

    // Protected admin pages
    if (!sessionId && !isPublic && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/adminAuth', req.url))
    }

    // Prevent visiting non-admin routes
    if (!isPublic && !pathname.startsWith('/admin') && pathname !== '/adminAuth') {
      const clean = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(new URL(`/admin/${clean}`, req.url))
    }

    return NextResponse.next()
  }

  // -----------------------------
  // MAIN DOMAIN – PRODUCTION (askremohealth.com)
  // -----------------------------

  // Admin routes belong to admin subdomain
  if (isAdminRoute && isProduction) {
    const adminURL = new URL(pathname, 'https://admin.askremohealth.com')
    return NextResponse.redirect(adminURL)
  }

  // adminAuth on main domain allowed
  if (pathname === '/adminAuth') {
    return NextResponse.next()
  }

  // -----------------------------
  // MAIN DOMAIN – STAGING (staging.askremohealth.com)
  // -----------------------------

  // Staging serves /admin directly (no redirect)
  if (isAdminRoute && isStaging) {
    return NextResponse.next()
  }

  // -----------------------------
  // DOCTORS SUBDOMAIN
  // -----------------------------
  if (isDoctorsSubdomain) {
    // Root → upcoming appointments
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL('/specialist/upcoming-appointments', req.url)
      )
    }

    // Unauthenticated → login
    if (!sessionId && !isPublic) {
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }

    // Force all pages into /specialist
    if (!isPublic && !pathname.startsWith('/specialist')) {
      const clean = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(new URL(`/specialist/${clean}`, req.url))
    }

    return NextResponse.next()
  }

  // -----------------------------
  // SPECIALIST ROUTES ON MAIN DOMAIN
  // -----------------------------

  if (isSpecialistRoute && isProduction) {
    const doctorsURL = new URL(pathname, 'https://doctors.askremohealth.com')
    return NextResponse.redirect(doctorsURL)
  }

  if (isSpecialistRoute && isStaging) {
    return NextResponse.next()
  }

  // Default: allow
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
