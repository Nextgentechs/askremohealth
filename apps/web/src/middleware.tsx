import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/appointments', '/profile']
const publicPaths = [
  '/login',
  '/signup',
  '/about-us',
  '/contact-us',
  '/doctors/:path*',
  '/find-hospital',
  '/api',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const sessionId = request.cookies.get('auth_session')?.value
    if (!sessionId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
