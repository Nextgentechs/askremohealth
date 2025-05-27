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
// const isSpecialistRoute = createRouteMatcher([
//   '/specialist/patients',
//   '/specialist/upcoming-appointments',
//   '/specialist/online-appointments',
//   '/specialist/physical-appointments',
//   '/specialist/profile',
// ])

const TEST_ADMIN_EMAILS = ['kristinenyaga@gmail.com']

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // ⛔️ Make sure to call protect() *before* calling auth()
    //await auth().protect()
  }

  const { sessionClaims } = await auth()
  console.log(sessionClaims,sessionClaims)

  // if (isSpecialistRoute(req)) {
  //   const onboardingComplete = sessionClaims?.metadata?.onboardingComplete

  //   if (!onboardingComplete) {
  //     return NextResponse.redirect(
  //       new URL('/specialist/onboarding/personal-details', req.url)
  //     )
  //   }
  // }

  if (isAdminRoute(req)) {
    // Already protected above, but double-check

    const email = sessionClaims?.email
    const isAdmin =
      sessionClaims?.metadata?.role === 'admin' ||
      (typeof email === 'string' && TEST_ADMIN_EMAILS.includes(email))

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
