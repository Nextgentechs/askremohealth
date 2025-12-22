'use client'

import { Button } from '@web/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@web/components/ui/sheet'
import { useCurrentUser } from '@web/hooks/use-current-user'
import {
  Book,
  BriefcaseMedical,
  Calendar,
  ChevronDown,
  ChevronsUpDown,
  FlaskConical,
  Home,
  Info,
  LogOut,
  Menu,
  Stethoscope,
  User,
} from 'lucide-react'
import Link from 'next/link'

const navOptions = [
  {
    label: 'Home',
    href: 'https://askremohealth.com/',
    icon: Home,
  },
  {
    label: 'About Us',
    href: 'https://askremohealth.com/about-us',
    icon: Info,
  },
  {
    label: 'Consult a Doctor',
    href: 'https://askremohealth.com/find-specialists',
    icon: Stethoscope,
  },
  {
    label: 'Lab Tests',
    href: 'https://askremohealth.com/laboratories',
    icon: FlaskConical,
  },
  {
    label: 'Blogs',
    href: 'https://askremohealth.com/articles',
    icon: Book,
  },
  {
    label: 'Contact Us',
    href: 'https://askremohealth.com/contact-us',
    icon: BriefcaseMedical,
  },
]

function AuthButtons({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <User className="size-4" />
            <span>Login</span>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40">
          <Link href="/auth?role=patient">
            <DropdownMenuItem className="cursor-pointer">
              Patient Login
            </DropdownMenuItem>
          </Link>
          {/* <Link href="https://doctors.askremohealth.com/auth?role=doctor">
            <DropdownMenuItem className="cursor-pointer">Doctor Login</DropdownMenuItem>
          </Link> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function MobileMenu() {
  const { user } = useCurrentUser()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="size-6 hover:cursor-pointer xl:hidden" />
      </SheetTrigger>
      <SheetContent className="flex flex-col items-start">
        <SheetTitle hidden>Menu</SheetTitle>
        <div className="flex flex-col py-4">
          {navOptions.map((option) => (
            <div key={option.label}>
              <SheetClose asChild>
                <Link
                  href={option.href ?? ''}
                  className="inline-flex h-9 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <option.icon className="size-4" />
                  <span>{option.label}</span>
                </Link>
              </SheetClose>
            </div>
          ))}
        </div>

        {user ? (
          <div className="ms-4">
            <CurrentUser user={user} />
          </div>
        ) : (
          <AuthButtons className="flex flex-col items-start border-t px-4 pt-4" />
        )}
      </SheetContent>
    </Sheet>
  )
}

function CurrentUser({
  user,
}: {
  user: { firstName?: string; lastName?: string; role?: string }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User />
          <span>
            {user?.firstName} {user?.lastName}
          </span>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-44 rounded-lg">
        <DropdownMenuGroup>
          {user?.role === 'doctor' ? (
            <Link href="/specialist/upcoming-appointments">
              <DropdownMenuItem className="cursor-pointer">
                <Calendar />
                Dashboard
              </DropdownMenuItem>
            </Link>
          ) : user?.role === 'patient' ? (
            <>
              <Link href="/patient/upcoming-appointments">
                <DropdownMenuItem className="cursor-pointer">
                  <Calendar />
                  Dashboard
                </DropdownMenuItem>
              </Link>
              <Link href="/appointments">
                <DropdownMenuItem className="cursor-pointer">
                  <Calendar />
                  Appointments
                </DropdownMenuItem>
              </Link>
            </>
          ) : null}
          {user?.role === 'patient' ? (
            <Link href="/patient/profile">
              <DropdownMenuItem className="cursor-pointer">
                <User />
                My Profile
              </DropdownMenuItem>
            </Link>
          ) : null}
          <>
            {user?.role === 'doctor' ? (
              <Link href="/specialist/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User />
                  My Profile
                </DropdownMenuItem>
              </Link>
            ) : null}
          </>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={async () => {
              await fetch('/api/auth/signout', { method: 'POST' })
              // Redirect to root domain homepage
              if (process.env.NODE_ENV === 'production') {
                window.location.href = 'https://askremohealth.com/'
              } else {
                window.location.href = 'http://localhost:3000/'
              }
            }}
          >
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
