'use client'

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
import {
  ChevronsUpDown,
  CircleUserRound,
  LogOut,
  User,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '../logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu'
import { useCurrentUser } from '@web/hooks/use-current-user'
import * as React from 'react'

interface AdminUser {
  firstName?: string
  lastName?: string
  email?: string
}

function NavUser() {
  const { isMobile } = useSidebar()
  const { user } = useCurrentUser() as { user: AdminUser | null }

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
                  {user ? `${user.firstName ?? ''} ${user.lastName ?? ''}` : 'Admin'}
                </span>
                <span className="truncate text-xs">{user?.email ?? ''}</span>
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
                  <span className="truncate font-semibold">
                    {user ? `${user.firstName ?? ''} ${user.lastName ?? ''}` : 'Admin'}
                  </span>
                  <span className="truncate text-xs">{user?.email ?? ''}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <Link href="/admin/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={async () => {
                  await fetch('/api/auth/signout', { method: 'POST' })
                  window.location.href = '/'
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const currentPath = pathname.split('/').pop()

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
                    className={`${
                      currentPath === item.url.split('/').pop()
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                        : ''
                    }`}
                    tooltip={item.title}
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

const data = {
  navMain: [
    { title: 'Overview', url: '/admin-template', icon: Users },
    { title: 'Doctors', url: '/admin/doctors', icon: Users },
    { title: 'Patients', url: '/admin-template/patients', icon: Users },
    { title: 'Appointments', url: '/admin-template/appointments', icon: Users },
  ],
}
