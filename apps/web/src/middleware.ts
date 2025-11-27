import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  // -----------------------------
  // Subdomain detection
  // -----------------------------
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  
  // Route detection
  const isAdminRoute = pathname.startsWith('/admin')
  const isSpecialistRoute = pathname.startsWith('/specialist')

  // Environment detection
  const isProduction = hostname === 'askremohealth.com' || hostname === 'www.askremohealth.com'
  const isStaging = hostname.includes('staging.askremohealth.com')

  // Public pages (not protected)
  const publicPaths = ['/', '/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  // -----------------------------
  // ADMIN SUBDOMAIN LOGIC
  // -----------------------------
  if (isAdminSubdomain) {
    // Default root → redirect to /adminAuth
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/adminAuth', req.url))
    }

    // Already logged in on login page → redirect to dashboard
    if (pathname === '/adminAuth' && sessionId) {
      return NextResponse.redirect(new URL('/admin/doctors', req.url))
    }

    // Protected admin pages → require session
    if (!sessionId && pathname.startsWith('/admin') && !isPublic) {
      return NextResponse.redirect(new URL('/adminAuth', req.url))
    }

    // Prevent visiting non-admin pages in admin subdomain
    if (!isPublic && !pathname.startsWith('/admin') && pathname !== '/adminAuth') {
      const clean = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(new URL(`/admin/${clean}`, req.url))
    }

    return NextResponse.next()
  }

  // -----------------------------
  // MAIN DOMAIN – PRODUCTION
  // -----------------------------
  if (isAdminRoute && isProduction) {
    // Redirect admin paths to admin subdomain
    const adminURL = new URL(pathname, 'https://admin.askremohealth.com')
    return NextResponse.redirect(adminURL)
  }

  if (pathname === '/adminAuth') {
    // Allow adminAuth on main domain (for testing or staging)
    return NextResponse.next()
  }

  // -----------------------------
  // MAIN DOMAIN – STAGING
  // -----------------------------
  if (isAdminRoute && isStaging) {
    // Allow /admin directly on staging
    return NextResponse.next()
  }

  // -----------------------------
  // DOCTORS SUBDOMAIN LOGIC
  // -----------------------------
  if (isDoctorsSubdomain) {
    // Root → redirect to upcoming appointments
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL('/specialist/upcoming-appointments', req.url)
      )
    }

    // Require login
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

  // -----------------------------
  // Default fallback → allow
  // -----------------------------
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
