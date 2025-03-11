import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/appointments',
  '/profile',
  '/admin',
  '/find-specialists/:id/book',
  '/specialists/(.*)',
  '/specialist/(.*)',
])
const isAdminRoute = createRouteMatcher(['/admin', '/admin/doctors'])
const isSpecialistRoute = createRouteMatcher([
  '/specialist/patients',
  '/specialist/upcoming-appointments',
  '/specialist/online-appointments',
  '/specialist/physical-appointments',
  '/specialist/profile',
])

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth()

  if (isProtectedRoute(req)) await auth.protect()

  if (isSpecialistRoute(req)) {
    if (!sessionClaims?.metadata.onboardingComplete) {
      return NextResponse.redirect(
        new URL('/specialist/onboarding/personal-details', req.url),
      )
    }
  }

  if (isAdminRoute(req)) {
    const isAdmin = sessionClaims?.metadata.role === 'admin'
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
