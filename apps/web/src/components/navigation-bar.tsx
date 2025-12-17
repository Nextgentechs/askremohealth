'use client'

import { useCurrentUser } from '@web/hooks/use-current-user'
import {
  Ambulance,
  Book,
  BriefcaseMedical,
  Building2,
  Calendar,
  ChevronDown,
  ChevronsUpDown,
  FlaskConical,
  Home,
  Hospital,
  HospitalIcon,
  Info,
  LogOut,
  Menu,
  Pill,
  Stethoscope,
  User,
} from 'lucide-react'
import Link from 'next/link'
import Logo from './logo'
import { ModeToggle } from './mode-toggle'
import { NotificationBell } from './notification-bell'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'

const navOptions = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'About Us',
    href: '/about-us',
    icon: Info,
  },
  {
    label: 'Find a Doctor',
    href: '/find-specialists',
    icon: Stethoscope,
  },
  {
    label: 'Lab Tests',
    href: '/laboratories',
    icon: FlaskConical,
  },
  {
    label: 'Medical Facilities',
    icon: Hospital,
    dropdownItems: [
      {
        label: 'Hospitals & Clinics',
        href: '/hospitals',
        icon: Building2,
      },
      {
        label: 'Laboratories',
        href: '/laboratories',
        icon: FlaskConical,
      },
      {
        label: 'Chemists & Drug Stores',
        href: '/hospitals',
        icon: Pill,
      },
      {
        label: '24/7 Ambulance Services',
        href: '/hospitals',
        icon: Ambulance,
      },
      {
        label: 'Home-based Care Services',
        href: '/hospitals',
        icon: Home,
      },
    ],
  },
  {
    label: 'Join as a Provider',
    icon: Stethoscope,
    dropdownItems: [
      {
        label: 'Doctor Portal',
        href: 'https://doctors.askremohealth.com/',
        icon: BriefcaseMedical,
      },
      {
        label: 'Clinic Portal',
        href: '/hospitals',
        icon: HospitalIcon,
      },
      {
        label: 'Lab Portal',
        href: '/labs',
        icon: FlaskConical,
      },
      {
        label: 'Hospital Portal',
        href: '/hospitals',
        icon: Ambulance,
      },
      {
        label: 'Pharmacy Portal',
        href: '/pharmacies',
        icon: Pill,
      },
    ],
  },

  {
    label: 'Blogs',
    href: '/articles',
    icon: Book,
  },
  {
    label: 'Contact Us',
    href: '/contact-us',
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
          {/* <Link href="/auth?role=doctor">
            <DropdownMenuItem className="cursor-pointer">Login as Doctor</DropdownMenuItem>
          </Link> */}
          <Link href="/auth?role=patient">
            <DropdownMenuItem className="cursor-pointer">
              Login as Patient
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function MobileMenu() {
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
              {option.dropdownItems ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-9 w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    <option.icon className="size-4" />
                    <span>{option.label}</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {option.dropdownItems.map((item) => (
                      <SheetClose asChild key={item.label}>
                        <Link href={item.href}>
                          <DropdownMenuItem className="gap-2">
                            <item.icon className="size-4" />
                            {item.label}
                          </DropdownMenuItem>
                        </Link>
                      </SheetClose>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <SheetClose asChild>
                  <Link
                    href={option.href ?? ''}
                    className="inline-flex h-9 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    <option.icon className="size-4" />
                    <span>{option.label}</span>
                  </Link>
                </SheetClose>
              )}
            </div>
          ))}
        </div>

        {user ? (
          <div className="flex items-center gap-2 ms-4">
            <ModeToggle />
            <NotificationBell />
            <CurrentUser user={user} />
          </div>
        ) : (
          <div className="flex items-center gap-2 border-t px-4 pt-4">
            <ModeToggle />
            <AuthButtons className="flex flex-col items-start" />
          </div>
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
              window.location.reload()
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

export default function NavigationBar() {
  const { user } = useCurrentUser()

  return (
    <header role="banner">
      <nav
        aria-label="Main navigation"
        className="flex w-full flex-row items-center justify-between lg:px-5"
      >
        <Logo />

        <NavigationMenu className="hidden list-none gap-1 xl:flex">
          {navOptions.map((option) => (
            <NavigationMenuItem key={option.label}>
              {option.dropdownItems ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={`${navigationMenuTriggerStyle()} gap-1`}
                    aria-haspopup="true"
                  >
                    {option.label}
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {option.dropdownItems.map((item) => (
                      <Link key={item.label} href={item.href}>
                        <DropdownMenuItem className="gap-2">
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href={option.href ?? '#'}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <span>{option.label}</span>
                  </NavigationMenuLink>
                </Link>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenu>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <NotificationBell />
              <CurrentUser user={user} />
            </div>
          ) : (
            <AuthButtons className="hidden flex-row items-center gap-4 lg:flex" />
          )}
          <ModeToggle />
          <MobileMenu />
        </div>
      </nav>
    </header>
  )
}
