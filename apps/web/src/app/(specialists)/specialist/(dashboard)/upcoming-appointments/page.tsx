import { api } from '@web/trpc/server'
import { redirect } from 'next/navigation'
import AppointmentTabs from './_components/appointment-tabs'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type: string; page: string; pageSize: string }>
}) {
  // Check if user is authenticated and has completed onboarding
  const user = await api.users.currentUser()
  
  if (!user) {
    // Redirect to login if not authenticated
    redirect('/auth')
  }
  
  if (user.role !== 'doctor') {
    // Redirect to appropriate dashboard if not a doctor
    redirect('/')
  }
  
  if (!user.onboardingComplete) {
    // Redirect to personal details form if onboarding not complete
    redirect('/specialist/onboarding/personal-details')
  }
  
  const { type, page, pageSize } = await searchParams
  const data = await api.doctors.upcommingAppointments({
    type: (type as 'online' | 'physical') ?? 'online',
    page: Number(page) ?? 1,
    pageSize: Number(pageSize) ?? 10,
  })

  return (
    <div className="mb-20 flex flex-col gap-8 md:mt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground lg:text-2xl">
          Welcome back!{' '}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is a list of your upcomming appointments
        </p>
      </div>

      <AppointmentTabs data={data} />
    </div>
  )
}
