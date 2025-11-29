import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  const isDoctorsSubdomain = hostname.startsWith('doctors.')
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isSpecialistRoute = pathname.startsWith('/specialist')

  const publicPaths = ['/', '/auth', '/about', '/contact', '/adminAuth']
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // ------------------------------------
  // ADMIN SUBDOMAIN
  // ------------------------------------
  if (isAdminSubdomain) {
    const res = NextResponse.next()

    // refresh cookie if exists
    if (sessionId) {
      res.cookies.set("session-id", sessionId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        domain: ".askremohealth.com",
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    // 1. No session → enforce /adminAuth
    if (!sessionId && pathname !== '/adminAuth') {
      const url = req.nextUrl.clone()
      url.pathname = '/adminAuth'
      return NextResponse.redirect(url)
    }

    // 2. With session → prevent staying on /adminAuth
    if (sessionId && pathname === '/adminAuth') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    // 3. With session & hitting "/" → send to dashboard
    if (sessionId && pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/doctors'
      return NextResponse.redirect(url)
    }

    return res
  }

  // ------------------------------------
  // DOCTORS SUBDOMAIN
  // ------------------------------------
  if (isDoctorsSubdomain) {
    const res = NextResponse.next()

    if (sessionId) {
      res.cookies.set("session-id", sessionId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        domain: ".askremohealth.com",
        maxAge: 60 * 60 * 24 * 7,
      })
    }

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

    return res
  }

  // ------------------------------------
  // SPECIALIST on MAIN DOMAIN
  // ------------------------------------
  if (isSpecialistRoute) {
    let doctorsHost =
      process.env.NODE_ENV === 'production'
        ? 'doctors.askremohealth.com'
        : 'doctors.localhost'

    const url = new URL(pathname, `https://${doctorsHost}`)
    const res = NextResponse.redirect(url)

    if (sessionId) {
      res.cookies.set('session-id', sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: '.askremohealth.com',
      })
    }

    return res
  }

  // Default pass-through
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
