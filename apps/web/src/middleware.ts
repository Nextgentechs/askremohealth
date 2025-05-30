import { NextResponse,NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value


  const pathname = req.nextUrl.pathname

  const isDoctorRoute = pathname.startsWith('/appointments')
  const isAdminRoute = pathname.startsWith('/admin')

  if (!sessionId && (isDoctorRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return NextResponse.next()
}
