import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  const isAdminSubdomain = hostname === 'admin.askremohealth.com' || hostname.startsWith('admin.')
  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  const isProduction = hostname === 'askremohealth.com' || hostname === 'www.askremohealth.com'
  const isStaging = hostname === 'staging.askremohealth.com' || hostname.startsWith('staging.')

  const publicPaths = ['/', '/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))

  console.log(
    `Middleware - Host: ${hostname}, Path: ${pathname}, Session: ${!!sessionId}, AdminSubdomain: ${isAdminSubdomain}, DoctorsSubdomain: ${isDoctorsSubdomain}`
  )

  // ---------- ADMIN SUBDOMAIN ----------
  if (isAdminSubdomain) {
    // Root path rewrites to login page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/adminAuth', `https://admin.askremohealth.com`))
    }

    // Set session from query parameter (login redirect)
    const urlSessionId = req.nextUrl.searchParams.get('sessionId')
    if (urlSessionId && !sessionId) {
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

    // Logged-in admins go to dashboard from login page
    if (pathname === '/adminAuth' && sessionId) {
      return NextResponse.redirect(new URL('/admin/doctors', `https://admin.askremohealth.com`))
    }

    // Allow access to /adminAuth if not logged in
    if (pathname === '/adminAuth' && !sessionId) {
      return NextResponse.next()
    }

    // Protect admin pages
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

  // ---------- DOCTORS SUBDOMAIN ----------
  if (isDoctorsSubdomain) {
    // Root path goes to upcoming appointments
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/specialist/upcoming-appointments', req.url))
    }

    // Require login for protected pages
    if (!sessionId && !isPublic) {
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }

    // Non-specialist paths get rewritten to /specialist/…
    if (!isPublic && !pathname.startsWith('/specialist')) {
      const cleanPath = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(new URL(`/specialist/${cleanPath}`, req.url))
    }

    return NextResponse.next()
  }

  // ---------- SPECIALIST PATHS ON MAIN DOMAIN ----------
  if (isSpecialistRoute && !isDoctorsSubdomain) {
    let doctorsHost = isProduction ? 'doctors.askremohealth.com' : 'doctors.localhost'
    const newUrl = new URL(pathname, `https://${doctorsHost}`)
    const response = NextResponse.redirect(newUrl)

    // Copy session cookie
    if (sessionId) {
      response.cookies.set('session-id', sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined
      })
    }

    return response
  }

  // ---------- MAIN DOMAIN ADMIN ROUTES ----------
  if (isAdminRoute && !isAdminSubdomain) {
    if (isProduction) {
      return NextResponse.redirect(new URL(pathname, 'https://admin.askremohealth.com'))
    }
    // Staging can access directly
    return NextResponse.next()
  }

  // Default: allow request
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
