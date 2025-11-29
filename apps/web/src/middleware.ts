import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isSpecialistRoute = pathname.startsWith('/specialist')

  const publicPaths = ['/', '/auth', '/about', '/contact', '/adminAuth']
  const isPublic = publicPaths.some((p) =>
    pathname === p || pathname.startsWith(p + '/')
  )

  // ---------------------------------------------------
  // ADMIN SUBDOMAIN
  // ---------------------------------------------------
  if (isAdminSubdomain) {
    const res = NextResponse.next()

    // 1. No session → enforce /adminAuth
    if (!sessionId && pathname !== '/adminAuth') {
      const url = req.nextUrl.clone()
      url.pathname = '/adminAuth'
      return NextResponse.redirect(url)
    }

    // 2. No session & already on /adminAuth → allow
    if (!sessionId && pathname === '/adminAuth') {
      return res
    }

    // 3. SESSION EXISTS (authenticated)
    // Refresh cookie ONLY here — not globally
    if (sessionId) {
      res.cookies.set('session-id', sessionId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: '.askremohealth.com',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    // 4. Authenticated but on /adminAuth → redirect to dashboard
    if (sessionId && pathname === '/adminAuth') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    // 5. Authenticated but at root → redirect to dashboard
    if (sessionId && pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    return res
  }

  // ---------------------------------------------------
  // DOCTORS SUBDOMAIN
  // ---------------------------------------------------
  if (isDoctorsSubdomain) {
    const res = NextResponse.next()

    // 1. Refresh cookies ONLY if logged in
    if (sessionId) {
      res.cookies.set('session-id', sessionId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: '.askremohealth.com',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    // 2. Unauthenticated → redirect to /auth
    if (!sessionId && !isPublic) {
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }

    // 3. Root route → specialist dashboard
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL('/specialist/upcoming-appointments', req.url)
      )
    }

    // 4. Protect specialist routes
    if (!isPublic && !pathname.startsWith('/specialist')) {
      const cleanPath = pathname.replace(/^\/+/, '')
      const newUrl = new URL(`/specialist/${cleanPath}`, req.url)
      return NextResponse.redirect(newUrl)
    }

    return res
  }

  // ---------------------------------------------------
  // SPECIALIST ON MAIN DOMAIN
  // ---------------------------------------------------
  if (isSpecialistRoute) {
    let doctorsHost =
      process.env.NODE_ENV === 'production'
        ? 'doctors.askremohealth.com'
        : 'doctors.localhost'

    const url = new URL(pathname, `https://${doctorsHost}`)
    const res = NextResponse.redirect(url)

    // refresh only if session exists
    if (sessionId) {
      res.cookies.set('session-id', sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: '.askremohealth.com',
      })
    }

    return res
  }

  // Default
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
