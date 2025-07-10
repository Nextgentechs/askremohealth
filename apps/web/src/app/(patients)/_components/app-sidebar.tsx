'use client'

import {
  ChevronsUpDown,
  ClipboardList,
  ClipboardPlus,
  House,
  LogOut,
  CircleUserRound,
  User,
} from 'lucide-react'
import * as React from 'react'

import Logo from '@web/components/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@web/components/ui/sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCurrentUser } from '@web/hooks/use-current-user'

// Define a User type for patient
interface PatientUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

function NavUser() {
  const { isMobile } = useSidebar()
  const { user } = useCurrentUser() as { user: PatientUser | null }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                <CircleUserRound className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user ? `${user.firstName ?? ''} ${user.lastName ?? ''}` : 'Patient'}
                </span>
                <span className="truncate text-xs">
                  {user?.email ?? ''}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <CircleUserRound className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user ? `${user.firstName ?? ''} ${user.lastName ?? ''}` : 'Patient'}</span>
                  <span className="truncate text-xs">{user?.email ?? ''}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/patient/profile">
                <DropdownMenuItem>
                  <User />
                  My Profile
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={async () => {
                  await fetch('/api/auth/signout', { method: 'POST' })
                  window.location.href = '/'
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

const data = {
  navMain: [
    {
      title: 'Upcoming Appointments',
      url: '/patient/upcoming-appointments',
      icon: House,
    },
    {
      title: 'Online Appointments',
      url: '/patient/online-appointments',
      icon: ClipboardPlus,
    },
    {
      title: 'Physical Appointments',
      url: '/patient/physical-appointments',
      icon: ClipboardList,
    },
    {
      title: 'Profile',
      url: '/patient/profile',
      icon: CircleUserRound,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <Link key={item.title} href={item.url}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname
                      .split('/')
                      .slice(1, 3)
                      .includes(item.url.split('/').pop() ?? '')}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
