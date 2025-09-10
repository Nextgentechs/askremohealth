'use client'

import {
  ChevronsUpDown,
  CircleUserRound,
  ClipboardList,
  House,
  LogOut,
} from 'lucide-react'
import * as React from 'react'

import Logo from '@web/components/logo'
import { Avatar, AvatarFallback } from '@web/components/ui/avatar' // Removed AvatarImage
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
import { api } from '@web/trpc/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function NavUser() {
  const { isMobile } = useSidebar()
  const { data: lab } = api.labs.currentLab.useQuery() // Assuming a similar API for labs

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">LB</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {`${(lab?.user?.firstName ?? '').charAt(0).toUpperCase() + (lab?.user?.firstName ?? '').slice(1)} ${(lab?.user?.lastName ?? '').charAt(0).toUpperCase() + (lab?.user?.lastName ?? '').slice(1)}`}
                </span>
                <span className="truncate text-xs">
                  {lab?.name ?? ''} {/* Assuming lab has a name field */}
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
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">LB</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{`${lab?.user?.firstName} ${lab?.user?.lastName}`}</span>
                  <span className="truncate text-xs">
                    {lab?.name}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/lab/profile">
                <DropdownMenuItem>
                  <CircleUserRound />
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
      title: 'Available Tests',
      url: '/lab/available-tests',
      icon: House,
    },
    {
      title: 'Appointments',
      url: '/lab/appointments',
      icon: ClipboardList,
    },
    {
      title: 'Profile',
      url: '/lab/profile',
      icon: CircleUserRound,
    },
  ],
}

export function LabSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
