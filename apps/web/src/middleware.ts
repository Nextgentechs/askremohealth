import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  const isAdminSubdomain = hostname.startsWith('admin.')
  const isDoctorsSubdomain = hostname.startsWith('doctors.')

  const isAdminRoute = pathname.startsWith('/admin')
  const isSpecialistRoute = pathname.startsWith('/specialist')

  const isProduction =
    hostname === 'askremohealth.com' || hostname === 'www.askremohealth.com'
  const isStaging = hostname.includes('staging.askremohealth.com')

  // Do NOT include "/" in public paths
  const publicPaths = ['/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  // ================================================================
  // ADMIN SUBDOMAIN
  // ================================================================
  if (isAdminSubdomain) {
    const isRoot = pathname === '/' || pathname === ''
    const isLoginPage = pathname === '/adminAuth' || isRoot

    // 1) Always redirect "/" → "/adminAuth" FIRST
    if (isRoot) {
      // logged-out user → go to adminAuth
      if (!sessionId) {
        return NextResponse.redirect('https://admin.askremohealth.com/adminAuth')
      }

      // logged-in user → go to dashboard
      return NextResponse.redirect('https://admin.askremohealth.com/admin/doctors')
    }

    // 2) Logged-in admin visiting login page → dashboard
    if (pathname === '/adminAuth' && sessionId) {
      return NextResponse.redirect('https://admin.askremohealth.com/admin/doctors')
    }

    // 3) Protected admin routes require session
    if (!sessionId && pathname.startsWith('/admin')) {
      return NextResponse.redirect('https://admin.askremohealth.com/adminAuth')
    }

    // 4) Prevent non-admin pages on admin subdomain
    if (!isPublic && !pathname.startsWith('/admin') && pathname !== '/adminAuth') {
      const clean = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(`https://admin.askremohealth.com/admin/${clean}`)
    }

    return NextResponse.next()
  }

  // ================================================================
  // MAIN DOMAIN
  // ================================================================
  if (isAdminRoute && isProduction) {
    return NextResponse.redirect(`https://admin.askremohealth.com${pathname}`)
  }

  if (pathname === '/adminAuth') return NextResponse.next()

  // ================================================================
  // DOCTORS SUBDOMAIN
  // ================================================================
  if (isDoctorsSubdomain) {
    if (pathname === '/') {
      return NextResponse.redirect(
        'https://doctors.askremohealth.com/specialist/upcoming-appointments'
      )
    }

    if (!sessionId && !isPublic) {
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }

    if (!isPublic && !pathname.startsWith('/specialist')) {
      const clean = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(
        `https://doctors.askremohealth.com/specialist/${clean}`
      )
    }

    return NextResponse.next()
  }

  // ================================================================
  // SPECIALIST ROUTES ON MAIN DOMAIN
  // ================================================================
  if (isSpecialistRoute && isProduction) {
    return NextResponse.redirect(`https://doctors.askremohealth.com${pathname}`)
  }

  if (isSpecialistRoute && isStaging) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
