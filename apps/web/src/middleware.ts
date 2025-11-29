import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  const publicPaths = ['/', '/auth', '/about', '/contact']
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // ----------------------------------------------------------
  // ADMIN SUBDOMAIN LOGIC
  // ----------------------------------------------------------
  if (isAdminSubdomain) {
    // 1. Landing page → always rewrite to /adminAuth
    if (!sessionId) {
      if (pathname !== '/adminAuth') {
        const url = req.nextUrl.clone()
        url.pathname = '/adminAuth'
        return NextResponse.rewrite(url)
      }
      return NextResponse.next()
    }

    // 2. Authenticated but visiting root → go to /admin/doctors
    if (sessionId && pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    // 3. Allow authenticated users to access /admin/... freely
    return NextResponse.next()
  }

  // ----------------------------------------------------------
  // DOCTORS SUBDOMAIN LOGIC (unchanged from your version)
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
