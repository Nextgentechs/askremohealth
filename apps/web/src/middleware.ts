import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  const isAdminSubdomain = hostname === 'admin.askremohealth.com' || hostname.startsWith('admin.')
  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  const isProduction =
    hostname === 'askremohealth.com' || hostname === 'www.askremohealth.com'
  const isStaging = hostname === 'staging.askremohealth.com' || hostname.startsWith('staging.')

  console.log(
    `Middleware - Host: ${hostname}, Path: ${pathname}, Session: ${!!sessionId}, AdminSubdomain: ${isAdminSubdomain}, DoctorsSubdomain: ${isDoctorsSubdomain}`
  )

  const publicPaths = ['/', '/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))

  // ---------- ADMIN SUBDOMAIN ----------
  if (isAdminSubdomain) {
    // Rewrite root to login page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/adminAuth', `https://admin.askremohealth.com`))
    }

    // Handle session from query parameter (after login redirect)
    const urlSessionId = req.nextUrl.searchParams.get('sessionId')
    if (urlSessionId) {
      const response = NextResponse.next()
      response.cookies.set('session-id', urlSessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        domain: '.askremohealth.com', // shared across all subdomains
        maxAge: 60 * 60 * 24 * 7,
      })
      return response
    }

    // Redirect logged-in admins from login page to dashboard
    if (pathname === '/adminAuth' && sessionId) {
      return NextResponse.redirect(new URL('/admin/doctors', `https://admin.askremohealth.com`))
    }

    // Protect admin pages (only redirect if not logged in)
    if (!sessionId && !isPublic && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/adminAuth', `https://admin.askremohealth.com`))
    }

    // Redirect non-admin paths on admin subdomain to /admin/…
    if (!isPublic && !pathname.startsWith('/admin') && pathname !== '/adminAuth') {
      const cleanPath = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(
        new URL(`/admin/${cleanPath}`, `https://admin.askremohealth.com`)
      )
    }

    return NextResponse.next()
  }

  // ---------- MAIN DOMAIN ----------
  // Allow /adminAuth directly without redirect for non-admin users
  if (pathname === '/adminAuth') return NextResponse.next()

  // Redirect /admin on main production domain to admin subdomain
  if (isAdminRoute && !isAdminSubdomain) {
    if (isProduction) {
      return NextResponse.redirect(new URL(pathname, 'https://admin.askremohealth.com'))
    } else if (isStaging) {
      return NextResponse.next()
    }
  }

  // ---------- DOCTORS SUBDOMAIN ----------
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
      return NextResponse.redirect(new URL(`/specialist/${cleanPath}`, req.url))
    }
    return NextResponse.next()
  }

  // ---------- SPECIALIST ROUTES ON MAIN DOMAIN ----------
  if (isSpecialistRoute && !isDoctorsSubdomain) {
    if (isProduction) {
      return NextResponse.redirect(new URL(pathname, 'https://doctors.askremohealth.com'))
    } else if (isStaging) {
      return NextResponse.next()
    }
  }

  // Default: allow request
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
