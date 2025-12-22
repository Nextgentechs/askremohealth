import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value ?? null
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isSpecialistRoute = pathname.startsWith('/specialist')

  const publicPaths = ['/', '/auth', '/about', '/contact', '/adminAuth']
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )

  // ---------------------------------------------------
  // ADMIN SUBDOMAIN RULES
  // ---------------------------------------------------
  if (isAdminSubdomain) {
    // No session → always redirect to /adminAuth
    if (!sessionId && !pathname.startsWith('/adminAuth')) {
      const url = req.nextUrl.clone()
      url.pathname = '/adminAuth'
      return NextResponse.redirect(url)
    }

    // Session exists but already on /adminAuth → go to dashboard
    if (sessionId && pathname === '/adminAuth') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    // Session exists and at root → go to dashboard
    if (sessionId && pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    // No refresh logic
    return NextResponse.next()
  }

  // ---------------------------------------------------
  // DOCTORS SUBDOMAIN RULES
  // ---------------------------------------------------
  if (isDoctorsSubdomain) {
    // Unauthenticated → redirect to /auth?role=doctor
    if (!sessionId && !isPublic) {
      const url = new URL(req.url)
      url.pathname = '/auth'
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }

    // Root → specialist dashboard
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL('/specialist/upcoming-appointments', req.url),
      )
    }

    // Protect all specialist routes
    if (!isPublic && !pathname.startsWith('/specialist')) {
      const cleanPath = pathname.replace(/^\/+/, '')
      const newUrl = new URL(`/specialist/${cleanPath}`, req.url)
      return NextResponse.redirect(newUrl)
    }

    return NextResponse.next()
  }

  // ---------------------------------------------------
  // SPECIALIST ON MAIN DOMAIN → move to doctors subdomain
  // ---------------------------------------------------
  if (isSpecialistRoute) {
    const doctorsHost =
      process.env.NODE_ENV === 'production'
        ? 'doctors.askremohealth.com'
        : 'doctors.localhost'

    const url = new URL(pathname, `https://${doctorsHost}`)
    return NextResponse.redirect(url)
  }

  // Default allow
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
