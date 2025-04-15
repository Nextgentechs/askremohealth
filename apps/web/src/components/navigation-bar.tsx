'use client'

import { useClerk } from '@clerk/nextjs'
import { api, type RouterOutputs } from '@web/trpc/react'
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
  LogIn,
  LogOut,
  Menu,
  Pill,
  Stethoscope,
  User,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import Logo from './logo'
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet'

const navOptions = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Find a Specialist',
    href: '/find-specialists',
    icon: Stethoscope,
  },
  {
    label: 'Healthcare Facilities',
    icon: Hospital,
    dropdownItems: [
      {
        label: 'Private Hospitals',
        href: '/hospitals',
        icon: Building2,
      },
      {
        label: 'Public Hospitals',
        href: '/hospitals',
        icon: Building2,
      },
      {
        label: 'Pharmacies',
        href: '/hospitals',
        icon: Pill,
      },
      {
        label: 'Laboratories',
        href: '/hospitals',
        icon: FlaskConical,
      },
      {
        label: 'Home-based Care Services',
        href: '/hospitals',
        icon: Home,
      },
      {
        label: 'Ambulance Service Providers',
        href: '/hospitals',
        icon: Ambulance
      }
    ],
  },
  {
    label: 'Articles',
    href: '/articles',
    icon: Book,
  },
  {
    label: 'For Specialists',
    href: '/specialist',
    icon: BriefcaseMedical,
    external: true,
  },
  {
    label: 'About Us',
    href: '/about-us',
    icon: Info,
  },
]

function AuthButtons({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      <Link
        href="/auth"
        className="inline-flex h-10 items-center justify-center py-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <LogIn className="mr-2 text-sm font-medium xl:text-sm" />
        Log in
      </Link>
      <Button variant="default">Book Appointment</Button>
    </div>
  )
}

function MobileMenu() {
  const { data: user } = api.users.currentUser.useQuery()

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
                    {...(option.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
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
  user: RouterOutputs['users']['currentUser']
}) {
  const { signOut } = useClerk()
  const utils = api.useUtils()

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
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
        <DropdownMenuGroup>
          <Link href="/appointments">
            <DropdownMenuItem className="cursor-pointer">
              <Calendar />
              Appointments
            </DropdownMenuItem>
          </Link>
          <Link href="/profile">
            <DropdownMenuItem className="cursor-pointer">
              <User />
              My Profile
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={async () => {
              await signOut()
              await utils.users.currentUser.refetch()
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
  const { data: user } = api.users.currentUser.useQuery()

  return (
    <div className="flex w-full flex-row items-center justify-between lg:px-5">
      <Logo />

      <NavigationMenu className="hidden list-none gap-1 xl:flex">
        {navOptions.map((option) => (
          <NavigationMenuItem key={option.label}>
            {option.dropdownItems ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`${navigationMenuTriggerStyle()} gap-1`}
                >
                  {option.label}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {option.dropdownItems.map((item) => (
                    <Link key={item.label} href={item.href}>
                      <DropdownMenuItem className="gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href={option.href ?? '#'} legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {option.label}
                </NavigationMenuLink>
              </Link>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenu>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="hidden sm:block">
            <CurrentUser user={user} />
          </div>
        ) : (
          <AuthButtons className="hidden flex-row items-center gap-4 lg:flex" />
        )}
        <MobileMenu />
        {/* <ModeToggle /> */}
      </div>
    </div>
  )
}
