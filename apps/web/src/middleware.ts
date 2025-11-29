import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? ''
  const pathname = req.nextUrl.pathname
  const sessionId = req.cookies.get('session-id')?.value ?? null

  const isAdminSubdomain = hostname === 'admin.askremohealth.com'
  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isPublicPath = ['/', '/auth', '/about', '/contact', '/favicon.ico'].some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  // ---------- ADMIN SUBDOMAIN ----------
  if (isAdminSubdomain) {
    // If no session, always rewrite root to login
    if (!sessionId && pathname === '/') {
      return NextResponse.rewrite(new URL('/adminAuth', `https://admin.askremohealth.com`))
    }

    // If session exists and visiting login page, redirect to dashboard
    if (sessionId && pathname === '/adminAuth') {
      return NextResponse.redirect(new URL('/admin/doctors', `https://admin.askremohealth.com`))
    }

    // Protect all /admin routes
    if (!sessionId && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/adminAuth', `https://admin.askremohealth.com`))
    }

    // Allow all other requests to proceed
    return NextResponse.next()
  }

  // ---------- DOCTORS SUBDOMAIN ----------
  if (isDoctorsSubdomain) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/specialist/upcoming-appointments', req.url))
    }
    if (!sessionId && !isPublicPath) {
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }
    if (!pathname.startsWith('/specialist') && !isPublicPath) {
      return NextResponse.redirect(new URL(`/specialist${pathname}`, req.url))
    }
    return NextResponse.next()
  }

  // ---------- MAIN DOMAIN ADMIN ROUTES ----------
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL(pathname, 'https://admin.askremohealth.com'))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
