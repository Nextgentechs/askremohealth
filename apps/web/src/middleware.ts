import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value ?? null
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  const isAdminSubdomain =
    hostname === 'admin.askremohealth.com' || hostname.startsWith('admin.')

  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  const isProduction =
    hostname === 'askremohealth.com' || hostname === 'www.askremohealth.com'
  const isStaging =
    hostname === 'staging.askremohealth.com' ||
    hostname.startsWith('staging.')

  const publicPaths = ['/', '/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  console.log(
    `Middleware - Host: ${hostname}, Path: ${pathname}, Session: ${!!sessionId}, AdminSubdomain: ${isAdminSubdomain}, DoctorsSubdomain: ${isDoctorsSubdomain}`
  )

  // ----------------------------------------------------------
  // ADMIN SUBDOMAIN
  // ----------------------------------------------------------
  if (isAdminSubdomain) {
    // Visit admin.askremohealth.com → rewrite to /adminAuth
    if (pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/adminAuth'
      return NextResponse.rewrite(url)
    }

    // Set session via ?sessionId=
    const urlSessionId = req.nextUrl.searchParams.get('sessionId')
    if (urlSessionId && !sessionId) {
      const response = NextResponse.next()
      response.cookies.set('session-id', urlSessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        domain: '.askremohealth.com',
        maxAge: 60 * 60 * 24 * 7,
      })
      return response
    }

    // If logged in and visiting /adminAuth → redirect to dashboard
    if (pathname === '/adminAuth' && sessionId) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    // Allow access to /adminAuth for non-authenticated admins
    if (pathname === '/adminAuth' && !sessionId) {
      return NextResponse.next()
    }

    // Protect /admin/* routes from non-logged-in users
    if (!sessionId && !isPublic && pathname.startsWith('/admin')) {
      const url = req.nextUrl.clone()
      url.pathname = '/adminAuth'
      return NextResponse.redirect(url)
    }

    // Redirect stray paths on admin subdomain to /admin/*
    if (!isPublic && !pathname.startsWith('/admin') && pathname !== '/adminAuth') {
      const url = req.nextUrl.clone()
      const cleanPath = pathname.replace(/^\/+/, '')
      url.pathname = `/admin/${cleanPath}`
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  // ----------------------------------------------------------
  // DOCTORS SUBDOMAIN
  // ----------------------------------------------------------
  if (isDoctorsSubdomain) {
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL('/specialist/upcoming-appointments', req.url)
      )
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

  // ----------------------------------------------------------
  // SPECIALIST ROUTES ON MAIN DOMAIN
  // ----------------------------------------------------------
  if (isSpecialistRoute && !isDoctorsSubdomain) {
    const doctorsHost = isProduction
      ? 'doctors.askremohealth.com'
      : 'doctors.localhost'

    const newUrl = new URL(pathname, `https://${doctorsHost}`)
    const response = NextResponse.redirect(newUrl)

    if (sessionId) {
      response.cookies.set('session-id', sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain:
          process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined,
      })
    }

    return response
  }

  // ----------------------------------------------------------
  // MAIN DOMAIN ADMIN ROUTES
  // ----------------------------------------------------------
  if (isAdminRoute && !isAdminSubdomain) {
    if (isProduction) {
      return NextResponse.redirect(
        new URL(pathname, 'https://admin.askremohealth.com')
      )
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
