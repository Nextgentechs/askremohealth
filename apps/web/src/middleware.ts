import { NextResponse, NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') || ''

  const isAdmin = host.startsWith('admin.')
  const isDoctors = host.startsWith('doctors.')
  const isSpecialistOnMain = !isDoctors && pathname.startsWith('/specialist')

  // -------------------------
  // Quick specialist redirect
  // -------------------------
  if (isSpecialistOnMain) {
    const doctorsDomain =
      process.env.NODE_ENV === 'production'
        ? 'https://doctors.askremohealth.com'
        : 'https://doctors.localhost'

    return NextResponse.redirect(doctorsDomain + pathname)
  }

  // -------------------------
  // Admin subdomain rules
  // -------------------------
  if (isAdmin) {
    if (!sessionId && !pathname.startsWith('/adminAuth')) {
      return NextResponse.redirect('/adminAuth')
    }

    if (sessionId && pathname === '/adminAuth') {
      return NextResponse.redirect('/admin/doctors')
    }

    return NextResponse.next()
  }

  // -------------------------
  // Doctors subdomain rules
  // -------------------------
  if (isDoctors) {
    const isPublic =
      pathname === '/' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/about') ||
      pathname.startsWith('/contact')

    if (!sessionId && !isPublic) {
      const url = new URL('/auth', req.url)
      url.searchParams.set('role', 'doctor')
      return NextResponse.redirect(url)
    }

    // Root → specialist landing
    if (pathname === '/') {
      return NextResponse.redirect('/specialist/upcoming-appointments')
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
