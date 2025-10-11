import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  // Check if the request is for the doctors subdomain
  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isSpecialistRoute = pathname.startsWith('/specialist')
   const isAdminSubdomain = hostname.startsWith('admin.')
  const isAdminRoute = pathname.startsWith('/admin')

  // Define public paths for doctors subdomain (add more as needed)
  const publicPaths = ['/', '/auth', '/about', '/contact']
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // Only protect doctors subdomain
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
  }
  
// ---------- ADMIN SUBDOMAIN LOGIC ----------
  if (isAdminSubdomain) {
    // Admin landing -> redirect to admin dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    // Protect admin pages (except public ones)
    if (!sessionId && !isPublic) {
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'admin')
      return NextResponse.redirect(url)
    }

    // If request is not under /admin, rewrite to /admin/<path> or redirect
    if (!isPublic && !pathname.startsWith('/admin')) {
      const cleanPath = pathname.replace(/^\/+/, '')
      // redirect keeps host as admin.askremohealth.com
      return NextResponse.redirect(new URL(`/admin/${cleanPath}`, req.url))
    }

    return NextResponse.next()
  }

  // If we're on the specialist path but not on the doctors subdomain
  if (isSpecialistRoute && !isDoctorsSubdomain) {
    // Remove 'www.' if present
    let doctorsHost = ''
    if (process.env.NODE_ENV === 'production') {
      doctorsHost = 'doctors.askremohealth.com'
    } else {
      // For local dev, use doctors.localhost
      doctorsHost = 'doctors.localhost'
    }
    const newUrl = new URL(pathname, `https://${doctorsHost}`)
    const response = NextResponse.redirect(newUrl)

    // Copy session cookie to the new domain
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
  // If we're on the admin path but not on the doctors subdomain


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
