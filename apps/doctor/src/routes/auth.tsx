import { createFileRoute, Outlet } from '@tanstack/react-router'
import logo from '@/assets/logo.svg'
import { Button } from '@/components/ui/button'
import { Moon } from 'lucide-react'
import { AuthProvider } from '@/context/auth-context'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
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
    <div className="inline-flex h-fit w-full justify-between px-8 pt-5">
      <img src={logo} />
      <Button variant={'outline'} size={'icon'} className="rounded-full shadow">
        <Moon />
      </Button>
    </div>
  )
}
