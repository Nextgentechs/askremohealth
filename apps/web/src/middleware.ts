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

  // -----------------------------
  // Route detection
  // -----------------------------
  const isAdminRoute = pathname.startsWith('/admin')
  const isSpecialistRoute = pathname.startsWith('/specialist')

  // -----------------------------
  // Environment detection
  // -----------------------------
  const isProduction =
    hostname === 'askremohealth.com' || hostname === 'www.askremohealth.com'
  const isStaging = hostname.includes('staging.askremohealth.com')

  // -----------------------------
  // Public paths (not protected)
  // -----------------------------
  const publicPaths = ['/', '/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  // -----------------------------
  // ADMIN SUBDOMAIN LOGIC
  // -----------------------------
  if (isAdminSubdomain) {
    // Root `/` → redirect to `/adminAuth`
    if (pathname === '/' || pathname === '') {
      return NextResponse.redirect('https://admin.askremohealth.com/adminAuth')
    }

    // Already logged-in admin visiting login → dashboard
    if (pathname === '/adminAuth' && sessionId) {
      return NextResponse.redirect('https://admin.askremohealth.com/admin/doctors')
    }

    // Require login for protected admin pages
    if (!sessionId && pathname.startsWith('/admin') && !isPublic) {
      return NextResponse.redirect('https://admin.askremohealth.com/adminAuth')
    }

    // Prevent visiting non-admin pages on admin subdomain
    if (!isPublic && !pathname.startsWith('/admin') && pathname !== '/adminAuth') {
      const cleanPath = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(`https://admin.askremohealth.com/admin/${cleanPath}`)
    }

    return NextResponse.next()
  }

  // -----------------------------
  // MAIN DOMAIN
  // -----------------------------
  // Redirect admin routes on main domain to admin subdomain
  if (isAdminRoute && isProduction) {
    return NextResponse.redirect(`https://admin.askremohealth.com${pathname}`)
  }

  // Allow adminAuth on main domain
  if (pathname === '/adminAuth') return NextResponse.next()

  // -----------------------------
  // DOCTORS SUBDOMAIN LOGIC
  // -----------------------------
  if (isDoctorsSubdomain) {
    if (pathname === '/') {
      return NextResponse.redirect('https://doctors.askremohealth.com/specialist/upcoming-appointments')
    }

    if (!sessionId && !isPublic) {
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }

    if (!isPublic && !pathname.startsWith('/specialist')) {
      const clean = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(`https://doctors.askremohealth.com/specialist/${clean}`)
    }

    return NextResponse.next()
  }

  // -----------------------------
  // SPECIALIST ROUTES ON MAIN DOMAIN
  // -----------------------------
  if (isSpecialistRoute && isProduction) {
    return NextResponse.redirect(`https://doctors.askremohealth.com${pathname}`)
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
