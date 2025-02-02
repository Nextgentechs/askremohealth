import DashboardLayout from '@/components/dashboard-layout'
import LinearProgressBar from '@/components/linear-progress'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context, location }) => {
    const user = await context.trpcQueryUtils.doctors.currentDoctor.ensureData()
    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  pendingComponent: () => <LinearProgressBar />,

  component: DashboardLayout,
})
