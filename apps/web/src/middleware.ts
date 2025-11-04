import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''
  const xOriginalHost = req.headers.get('x-original-host') // From nginx proxy
  const xProxySource = req.headers.get('x-proxy-source') // From nginx proxy

  // Check if this is a proxied request from admin subdomain
  const isProxiedAdminRequest = xProxySource === 'admin-subdomain' || 
                               (hostname.includes('staging.askremohealth.com') && 
                                xOriginalHost?.includes('admin.askremohealth.com'))

  // Use the original host for proxied requests, otherwise use current host
  const effectiveHostname = isProxiedAdminRequest ? (xOriginalHost ?? hostname) : hostname

  const isDoctorsSubdomain = effectiveHostname.startsWith('doctors.')
  const isAdminSubdomain = effectiveHostname.startsWith('admin.') || isProxiedAdminRequest
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  // Determine if we're on production or staging
  const isProduction = hostname === 'askremohealth.com' || hostname === 'www.askremohealth.com'
  const isStaging = hostname.includes('staging.askremohealth.com')

  // Debug logging
  console.log(`Middleware - Host: ${hostname}, Effective Host: ${effectiveHostname}, Proxied: ${isProxiedAdminRequest}, Production: ${isProduction}, Staging: ${isStaging}, Path: ${pathname}, Session: ${!!sessionId}`)

  // Public paths
  const publicPaths = ['/', '/auth', '/adminAuth', '/about', '/contact', '/favicon.ico']
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // ---------- ADMIN SUBDOMAIN BEHAVIOR ----------
  // This works for both staging (proxied) and production (direct) admin subdomain access
  if (isAdminSubdomain) {
    console.log(`Admin access detected - Proxied: ${isProxiedAdminRequest}, Path: ${pathname}, Session: ${!!sessionId}`)

    // CRITICAL: For proxied requests without cookies, we need alternative session handling
    if (isProxiedAdminRequest && !sessionId) {
      // Check for session in query parameters or other headers
      const urlSessionId = req.nextUrl.searchParams.get('sessionId')
      
      if (urlSessionId && pathname.startsWith('/admin')) {
        // If we have a session ID in query params for admin routes, set it as cookie
        const response = NextResponse.next()
        response.cookies.set('session-id', urlSessionId, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: false,
          sameSite: 'lax' as const,
          maxAge: 60 * 60 * 24 * 7,
        })
        return response
      }
      
      // If no session and trying to access protected admin routes, redirect to adminAuth
      if (!isPublic && pathname.startsWith('/admin')) {
        console.log('Proxied admin route without session - redirecting to /adminAuth')
        return NextResponse.redirect(new URL('/adminAuth', req.url))
      }
    }

    // Always serve /adminAuth for root path on admin subdomain
    if (pathname === '/') {
      console.log('Admin root - rewriting to /adminAuth')
      return NextResponse.rewrite(new URL('/adminAuth', req.url))
    }

    // If visiting the admin auth page on the admin host and the user already has a session, redirect to dashboard
    if (pathname === '/adminAuth' && sessionId) {
      console.log('Admin auth page with session - redirecting to dashboard')
      return NextResponse.redirect(new URL('/admin/doctors', req.url))
    }

    // Protect admin pages (except public paths like /adminAuth) for non-proxied requests
    if (!isProxiedAdminRequest && !sessionId && !isPublic && pathname.startsWith('/admin')) {
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

  // ---------- MAIN DOMAIN LOGIC (both staging and production) ----------
  
  // Handle adminAuth on main domains - allow direct access
  if (pathname === '/adminAuth' && (isStaging || isProduction)) {
    console.log('AdminAuth on main domain - allowing access')
    return NextResponse.next()
  }

  // If the request is an /admin route on PRODUCTION main domain, redirect to admin subdomain
  if (isAdminRoute && !isAdminSubdomain && !isProxiedAdminRequest && isProduction) {
    const adminHost = 'admin.askremohealth.com'
    const newUrl = new URL(pathname, `https://${adminHost}`)
    console.log(`Admin route on production main domain - redirecting to ${newUrl.toString()}`)
    return NextResponse.redirect(newUrl)
  }

  // If the request is an /admin route on STAGING main domain, allow it (no redirect)
  if (isAdminRoute && !isAdminSubdomain && !isProxiedAdminRequest && isStaging) {
    console.log('Admin route on staging main domain - allowing direct access')
    return NextResponse.next()
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

  // If we're on a specialist path on PRODUCTION main domain, redirect to doctors subdomain
  if (isSpecialistRoute && !isDoctorsSubdomain && isProduction) {
    const doctorsHost = 'doctors.askremohealth.com'
    const newUrl = new URL(pathname, `https://${doctorsHost}`)
    console.log(`Specialist route on production main domain - redirecting to ${doctorsHost}`)
    return NextResponse.redirect(newUrl)
  }

  // If we're on a specialist path on STAGING main domain, allow it (no redirect)
  if (isSpecialistRoute && !isDoctorsSubdomain && isStaging) {
    console.log('Specialist route on staging main domain - allowing direct access')
    return NextResponse.next()
  }

  // Default: allow the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}