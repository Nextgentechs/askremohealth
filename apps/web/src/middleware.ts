import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''
  const xOriginalHost = req.headers.get('x-original-host') // From nginx proxy
  const xProxySource = req.headers.get('x-proxy-source') // From nginx proxy

  // Check if this is a proxied request from admin.askremohealth.com
  const isProxiedAdminRequest = xProxySource === 'admin-subdomain' || 
                               (hostname === 'staging.askremohealth.com' && 
                                xOriginalHost === 'admin.askremohealth.com')

  // Use the original host for proxied requests, otherwise use current host
  const effectiveHostname = isProxiedAdminRequest ? (xOriginalHost ?? hostname) : hostname

  const isDoctorsSubdomain = effectiveHostname.startsWith('doctors.')
  const isAdminSubdomain = effectiveHostname.startsWith('admin.') || isProxiedAdminRequest
  const isSpecialistRoute = pathname.startsWith('/specialist')
  const isAdminRoute = pathname.startsWith('/admin')

  // Debug logging - enhanced to show proxy info
  console.log(`Middleware - Host: ${hostname}, Effective Host: ${effectiveHostname}, Proxied: ${isProxiedAdminRequest}, Path: ${pathname}, Session: ${!!sessionId}`)

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
  // This now includes both direct admin subdomain access AND proxied requests
  if (isAdminSubdomain) {
    console.log(`Admin access detected - Proxied: ${isProxiedAdminRequest}, Path: ${pathname}, Session: ${!!sessionId}`)

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

  // FIX: Only redirect to admin.askremohealth.com if we're NOT a proxied request
  // and we're on the main domain (not staging)
  if (pathname === '/adminAuth' && !isAdminSubdomain && !isProxiedAdminRequest && !hostname.includes('staging.')) {
    const adminHost = 'admin.askremohealth.com'
    console.log(`AdminAuth on production domain - redirecting to ${adminHost}`)
    return NextResponse.redirect(new URL('/adminAuth', `https://${adminHost}`))
  }

  // FIX: Allow adminAuth on staging without redirect when it's a proxied request
  if (pathname === '/adminAuth' && isProxiedAdminRequest) {
    console.log('AdminAuth on proxied admin request - allowing access')
    return NextResponse.next()
  }

  // If the request is an /admin route on MAIN domain, redirect to admin subdomain and copy session cookie (if present)
  // But only if it's not a proxied request and not on staging
  if (isAdminRoute && !isAdminSubdomain && !isProxiedAdminRequest && !hostname.includes('staging.')) {
    const adminHost = 'admin.askremohealth.com'
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
  if (isSpecialistRoute && !isDoctorsSubdomain && !hostname.includes('staging.')) {
    const doctorsHost = 'doctors.askremohealth.com'
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