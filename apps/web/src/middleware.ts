import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  const publicPaths = ['/', '/auth', '/about', '/contact', '/adminAuth']
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // ----------------------------------------------------------
  // ADMIN SUBDOMAIN LOGIC - FIXED
  // ----------------------------------------------------------
  if (isAdminSubdomain) {
    // 1. If no session and NOT on adminAuth → redirect to adminAuth
    if (!sessionId && pathname !== '/adminAuth') {
      const url = req.nextUrl.clone()
      url.pathname = '/adminAuth'
      return NextResponse.redirect(url) // Use redirect instead of rewrite
    }

    // 2. If no session but already on adminAuth → allow access
    if (!sessionId && pathname === '/adminAuth') {
      return NextResponse.next()
    }

    // 3. If has session and on root → redirect to /admin/doctors
    if (sessionId && pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    // 4. If has session and on adminAuth → redirect to /admin/doctors
    if (sessionId && pathname === '/adminAuth') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    // 5. Allow all other authenticated requests
    return NextResponse.next()
  }

  // ----------------------------------------------------------
  // DOCTORS SUBDOMAIN LOGIC (unchanged)
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
      const newUrl = new URL(`/specialist/${cleanPath}`, req.url)
      return NextResponse.redirect(newUrl)
    }
  }

  // ----------------------------------------------------------
  // SPECIALIST ROUTE ON MAIN DOMAIN → redirect to doctors subdomain
  // ----------------------------------------------------------
  if (isSpecialistRoute && !isDoctorsSubdomain) {
    let doctorsHost =
      process.env.NODE_ENV === 'production'
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
          process.env.NODE_ENV === 'production'
            ? '.askremohealth.com'
            : undefined,
      })
    }

    return response
  }

  return NextResponse.next()
}

// Middleware matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}