import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''
  const xOriginalHost = req.headers.get('x-original-host') // From nginx proxy

  // Use the original host if available (from proxy), otherwise use the current host
  const effectiveHostname = xOriginalHost ?? hostname

  const isDoctorsSubdomain = effectiveHostname.startsWith('doctors.')
  const isAdminSubdomain = effectiveHostname.startsWith('admin.')
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  // Debug logging
  console.log(`Middleware - Host: ${hostname}, Effective Host: ${effectiveHostname}, Path: ${pathname}, Session: ${!!sessionId}`)

  // Public paths - adminAuth is a public auth page
  const publicPaths = ['/', '/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // helper for cookie options when copying across domains
  const cookieOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined,
  }

  // ---------- ADMIN SUBDOMAIN BEHAVIOR ----------
  if (isAdminSubdomain) {
    console.log(`Admin subdomain detected: effectiveHost=${effectiveHostname}, pathname=${pathname}, sessionId=${!!sessionId}`)

    // Admin root: pick landing - either auth (no session) or dashboard (session)
    if (pathname === '/') {
      if (!sessionId) {
        // Rewrite to adminAuth page
        console.log('Admin root without session - rewriting to /adminAuth')
        return NextResponse.rewrite(new URL('/adminAuth', req.url))
      } else {
        console.log('Admin root with session - redirecting to /admin/doctors')
        return NextResponse.redirect(new URL('/admin/doctors', req.url))
      }
    }

    // If visiting the admin auth page on the admin host and the user already has a session, redirect to dashboard
    if (pathname === '/adminAuth' && sessionId) {
      console.log('Admin auth page with session - redirecting to dashboard')
      return NextResponse.redirect(new URL('/admin/doctors', req.url))
    }

    // Protect admin pages (except public paths like /adminAuth)
    if (!sessionId && !isPublic && pathname.startsWith('/admin')) {
      console.log('Protected admin route without session - redirecting to /adminAuth')
      return NextResponse.redirect(new URL('/adminAuth', req.url))
    }

    // Only redirect non-public, non-admin routes that are NOT /adminAuth
    if (!isPublic && !pathname.startsWith('/admin') && pathname !== '/adminAuth') {
      const cleanPath = pathname.replace(/^\/+/, '')
      console.log(`Non-admin route on admin subdomain - redirecting to /admin/${cleanPath}`)
      return NextResponse.redirect(new URL(`/admin/${cleanPath}`, req.url))
    }

    console.log('Allowing request to proceed on admin subdomain')
    return NextResponse.next()
  }

  // If the request is to the adminAuth path on the MAIN hostname (askremohealth.com),
  // redirect to admin subdomain so admins use admin.askremohealth.com/adminAuth
  if (pathname === '/adminAuth' && !isAdminSubdomain) {
    const adminHost = 'admin.askremohealth.com' // Always redirect to production admin domain
    console.log(`AdminAuth on main domain - redirecting to ${adminHost}`)
    return NextResponse.redirect(new URL('/adminAuth', `https://${adminHost}`))
  }

  // If the request is an /admin route on MAIN domain, redirect to admin subdomain and copy session cookie (if present)
  if (isAdminRoute && !isAdminSubdomain) {
    const adminHost = 'admin.askremohealth.com' // Always redirect to production admin domain
    const newUrl = new URL(pathname, `https://${adminHost}`)
    const response = NextResponse.redirect(newUrl)

    if (sessionId) {
      // copy cookie so admin subdomain and sibling subdomains can access it
      response.cookies.set('session-id', sessionId, cookieOptions)
    }

    console.log(`Admin route on main domain - redirecting to ${newUrl.toString()}`)
    return response
  }

  // ---------- DOCTORS SUBDOMAIN LOGIC ----------
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
      const newUrl = new URL(`/specialist/${cleanPath}`, req.url)
      return NextResponse.redirect(newUrl)
    }

    return NextResponse.next()
  }

  // If we're on a specialist path on main domain, redirect to doctors subdomain (copy cookie when present)
  if (isSpecialistRoute && !isDoctorsSubdomain) {
    const doctorsHost =
      process.env.NODE_ENV === 'production' ? 'doctors.askremohealth.com' : 'doctors.localhost'
    const newUrl = new URL(pathname, `https://${doctorsHost}`)
    const response = NextResponse.redirect(newUrl)

    if (sessionId) {
      response.cookies.set('session-id', sessionId, cookieOptions)
    }

    return response
  }

  // Default: allow the request on main domain
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}