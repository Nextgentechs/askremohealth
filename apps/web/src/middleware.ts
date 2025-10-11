import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  // Subdomain / route flags
  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  // Public paths
  const publicPaths = ['/', '/auth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // ---------------------------
  // Safety-net: if user hits /auth?role=admin and already has a session,
  // redirect them straight to the admin doctors dashboard.
  // ---------------------------
  if (pathname === '/auth') {
    const roleParam = req.nextUrl.searchParams.get('role')
    if (roleParam === 'admin' && sessionId) {
      const adminHost =
        process.env.NODE_ENV === 'production' ? 'admin.askremohealth.com' : 'admin.localhost'
      const target = new URL('/admin/doctors', `https://${adminHost}`)
      const response = NextResponse.redirect(target)

      // ensure cookie is set for subdomain if not already; copy existing cookie
      response.cookies.set('session-id', sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined,
      })

      return response
    }
  }

  // ---------- ADMIN SUBDOMAIN LOGIC ----------
if (isAdminSubdomain) {
  const adminHost =
    process.env.NODE_ENV === 'production'
      ? 'admin.askremohealth.com'
      : 'admin.localhost'

    // Root path on admin subdomain
    if (pathname === '/') {
      if (!sessionId) {
        // No session: redirect to auth
        const url = new URL('/auth', `https://${adminHost}`)
        url.searchParams.set('role', 'admin')
        return NextResponse.redirect(url)
      } else {
        // Session exists: redirect to dashboard
        return NextResponse.redirect(new URL('/admin/doctors', `https://${adminHost}`))
      }
    }

    // Protect admin pages (except public)
    if (!sessionId && !isPublic) {
      const url = new URL('/auth', `https://${adminHost}`)
      url.searchParams.set('role', 'admin')
      return NextResponse.redirect(url)
    }

    // Rewrite paths that are not under /admin
    if (!isPublic && !pathname.startsWith('/admin')) {
      const cleanPath = pathname.replace(/^\/+/, '')
      return NextResponse.redirect(new URL(`/admin/${cleanPath}`, `https://${adminHost}`))
    }

    return NextResponse.next()
  }

  // ---------- DOCTORS SUBDOMAIN LOGIC ----------
  if (isDoctorsSubdomain) {
    // Special case: root path should always go to the doctor's panel
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/specialist/upcoming-appointments', req.url))
    }

    if (!sessionId && !isPublic) {
      // Redirect to /auth?role=doctor
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }

    // Only rewrite to /specialist if not a public path and not already on /specialist
    if (!isPublic && !pathname.startsWith('/specialist')) {
      const cleanPath = pathname.replace(/^\/+/, '')
      const newUrl = new URL(`/specialist/${cleanPath}`, req.url)
      return NextResponse.redirect(newUrl)
    }

    return NextResponse.next()
  }

  // If we're on the specialist path but not on the doctors subdomain,
  // redirect the user to the doctors subdomain and copy session cookie.
  if (isSpecialistRoute && !isDoctorsSubdomain) {
    const doctorsHost =
      process.env.NODE_ENV === 'production' ? 'doctors.askremohealth.com' : 'doctors.localhost'
    const newUrl = new URL(pathname, `https://${doctorsHost}`)
    const response = NextResponse.redirect(newUrl)

    if (sessionId) {
      response.cookies.set('session-id', sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined,
      })
    }

    return response
  }

  // If the request is for admin path on the main domain (not admin subdomain),
  // redirect to the admin subdomain and copy cookie.
  if (isAdminRoute && !isAdminSubdomain) {
    const adminHost =
      process.env.NODE_ENV === 'production' ? 'admin.askremohealth.com' : 'admin.localhost'
    const newUrl = new URL(pathname, `https://${adminHost}`)
    const response = NextResponse.redirect(newUrl)

    if (sessionId) {
      response.cookies.set('session-id', sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined,
      })
    }

    return response
  }

  // Default: allow request
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
