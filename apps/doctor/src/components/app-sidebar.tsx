import * as React from 'react'
import {
  ChevronsUpDown,
  CircleUserRound,
  ClipboardList,
  ClipboardPlus,
  House,
  LogOut,
  ShieldPlus,
  User,
} from 'lucide-react'

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
} from '@/components/ui/sidebar'
import Logo from './logo'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { api } from '@/lib/trpc'

function NavUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const [doctor] = api.users.doctor.current.useSuspenseQuery()

  const { mutateAsync } = api.auth.doctor.signOut.useMutation()
  const utils = api.useUtils()

  const handleSignout = async () => {
    await mutateAsync()
    await utils.users.currentUser.refetch()
    await utils.invalidate()
    await router.invalidate()
    router.navigate({ to: '/auth/login' })
  }

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
                <AvatarImage
                  src={doctor?.user.profilePicture.url}
                  alt={doctor?.user.firstName}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{`${doctor?.user.firstName} ${doctor?.user.lastName}`}</span>
                <span className="truncate text-xs">
                  {doctor?.specialty?.name}
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
                  <AvatarImage
                    src={doctor?.user.profilePicture.url}
                    alt={doctor?.user.firstName}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{`${doctor?.user.firstName} ${doctor?.user?.lastName}`}</span>
                  <span className="truncate text-xs">
                    {doctor?.specialty?.name}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/dashboard/profile">
                <DropdownMenuItem>
                  <User />
                  My Profile
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handleSignout}>
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
  user: {
    name: 'Kennedy',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },

  navMain: [
    {
      title: 'Upcomming Appointments',
      url: '/dashboard/upcomming-appointments',
      icon: House,
    },
    {
      title: 'Physical Appointments',
      url: '/dashboard/physical-appointments',
      icon: ClipboardList,
    },
    {
      title: 'Online Appointments',
      url: '/dashboard/online-appointments',
      icon: ClipboardPlus,
    },
    {
      title: 'Patients',
      url: '/dashboard/patients',
      icon: ShieldPlus,
    },
    {
      title: 'Profile',
      url: '/dashboard/profile',
      icon: CircleUserRound,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const state = useRouterState()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <Link key={item.title} to={item.url}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={state.location.pathname === item.url}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            ))}
          </SidebarMenu>
          <Link to="/dashboard" />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
