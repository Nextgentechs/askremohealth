import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import logo from '@/assets/logo.svg'
import { AuthProvider } from '@/context/auth-context'
import { ModeToggle } from '@/components/mode-toggle'
import { z } from 'zod'
import LinearProgressBar from '@/components/linear-progress'

const searchSchema = z.object({
  redirect: z.string().default('/dashboard/upcomming-appointments'),
})

export const Route = createFileRoute('/auth')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context, search }) => {
    if (await context.trpcQueryUtils.users.currentUser.ensureData()) {
      throw redirect({ to: search.redirect })
    }
  },
  component: RouteComponent,
  pendingComponent: () => <LinearProgressBar />,
})

function RouteComponent() {
  return (
    <AuthProvider>
      <div className="container flex min-h-dvh flex-col">
        <Navbar />
        <Outlet />
      </div>
    </AuthProvider>
  )
}

function Navbar() {
  return (
    <div className="inline-flex h-fit w-full justify-between px-2 pt-5 sm:px-4 md:px-8">
      <img src={logo} />
      <ModeToggle />
    </div>
  )
}
