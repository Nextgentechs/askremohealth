'use client'

import { Button } from './ui/button'
import {
  Book,
  Home,
  Hospital,
  Info,
  LogIn,
  Menu,
  Stethoscope,
} from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet'
import Link from 'next/link'
import Logo from './logo'

const navOptions = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Find a Doctor',
    href: '/find-doctor',
    icon: Stethoscope,
  },
  {
    label: 'Find a Hospital',
    href: '/find-hospital',
    icon: Hospital,
  },
  {
    label: 'Health Articles',
    href: '/health-articles',
    icon: Book,
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
        href="/login"
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
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="size-6 hover:cursor-pointer xl:hidden" />
      </SheetTrigger>
      <SheetContent className="flex flex-col items-start">
        <SheetTitle hidden>Menu</SheetTitle>
        <div className="flex flex-col py-4">
          {navOptions.map((option) => (
            <Link
              key={option.label}
              href={option.href}
              className="inline-flex h-9 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <option.icon className="size-4" />
              <span>{option.label}</span>
            </Link>
          ))}
        </div>
        <AuthButtons className="flex flex-col items-start border-t px-4 pt-4" />
      </SheetContent>
    </Sheet>
  )
}

export default function NavigationBar() {
  return (
    <div className="flex w-full flex-row items-center justify-between">
      <Logo />

      <NavigationMenu className="hidden list-none gap-1 xl:flex">
        {navOptions.map((option) => (
          <NavigationMenuItem key={option.label}>
            <Link href={option.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} hover:underline`}
              >
                {option.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenu>

      <div className="flex items-center gap-4">
        <AuthButtons className="hidden lg:flex lg:gap-4" />
        <MobileMenu />
        {/* <ModeToggle /> */}
      </div>
    </div>
  )
}
