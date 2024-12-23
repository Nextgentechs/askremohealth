import DashboardLayout from '@/components/dashboard-layout'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    const user = await context.trpcQueryUtils.users.currentUser.ensureData()
    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }
  },

  component: DashboardLayout,
})
