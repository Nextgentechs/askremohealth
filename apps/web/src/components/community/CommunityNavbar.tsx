'use client'

import { useCurrentUser } from '@web/hooks/use-current-user'
import {
  ChevronDown,
  ChevronsUpDown,
  Home as HomeIcon,
  LogOut,
  Menu,
  MessageCircleMore,
  Store,
  User,
} from 'lucide-react'
import Link from 'next/link'
import Logo from '@web/components/logo'
import { Button } from '@web/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@web/components/ui/sheet'

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
            <DropdownMenuItem className="cursor-pointer">Patient Login</DropdownMenuItem>
          </Link>
          <Link href="https://doctors.askremohealth.com/auth?role=doctor">
            <DropdownMenuItem className="cursor-pointer">Doctor Login</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="size-6 hover:cursor-pointer lg:hidden" />
      </SheetTrigger>
      <SheetContent className="flex flex-col items-start" side="left">
        <SheetTitle hidden>Menu</SheetTitle>
        <div className="p-4 bg-white text-sm text-gray-800 flex flex-col gap-2">
          <SheetClose asChild>
            <Link
              href="/community"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
            >
              <HomeIcon/>
              <span>Home</span>
            </Link>
          </SheetClose>
          <hr className="border-t-1 border-gray-50 w-36 self-center" />
          <SheetClose asChild>
            <Link
              href="/community/chats"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
            >
              <MessageCircleMore/>
              <span>My Chats</span>
            </Link>
          </SheetClose>
          <hr className="border-t-1 border-gray-50 w-36 self-center" />
          <SheetClose asChild>
            <Link
              href="/community"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
            >
              <User/>
              <span>My Profile</span>
            </Link>
          </SheetClose>
          <hr className="border-t-1 border-gray-50 w-36 self-center" />
          <SheetClose asChild>
            <Link
              href="/community"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
            >
              <Store/>
              <span>Marketplace</span>
            </Link>
          </SheetClose>
        </div>
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
            {user?.firstName}
            <span className="hidden lg:inline">
              {" "}{user?.lastName}
            </span>
          </span>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-44 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={async () => {
              await fetch('/api/auth/signout', { method: 'POST' })
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

export default function NavigationBar() {
  const { user } = useCurrentUser()

  return (
    <div className="flex w-full flex-row items-center justify-between lg:px-5">
      {/* Mobile menu on left for screens smaller than lg */}
      <div className="lg:hidden">
        <MobileMenu />
      </div>

      {/* Logo in center on small screens, left on large screens */}
      <div className="lg:flex-none">
        <Logo />
      </div>

      {/* Auth buttons - hidden on small screens, visible on large screens and up */}
      <div className="flex items-center gap-4">
        {user ? (
          <CurrentUser user={user} />
        ) : (
          <AuthButtons />
        )}
      </div>
    </div>
  )
}