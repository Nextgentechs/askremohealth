import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// const protectedPaths = ['/appointments', '/profile']
// const publicPaths = [
//   '/login',
//   '/signup',
//   '/about-us',
//   '/contact-us',
//   '/doctors/:path*',
//   '/find-hospital',
//   '/api',
// ]

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl
//   if (publicPaths.some((path) => pathname.startsWith(path))) {
//     return NextResponse.next()
//   }

//   if (protectedPaths.some((path) => pathname.startsWith(path))) {
//     const sessionId = request.cookies.get('auth_session')?.value
//     if (!sessionId) {
//       return NextResponse.redirect(new URL('/login', request.url))
//     }
//     return NextResponse.next()
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
// }
