import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { sessionClaims } = await auth()
  if (!sessionClaims?.metadata.onboardingComplete) {
    return redirect('/specialist/onboarding/personal-details')
  }
  return redirect('/specialist/upcoming-appointments')
}
