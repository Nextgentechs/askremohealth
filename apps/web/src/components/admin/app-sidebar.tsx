'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from '@web/components/ui/sidebar'
import Logo from '../logo'
import { DropdownMenuItem } from '../ui/dropdown-menu'
import { DropdownMenuGroup } from '../ui/dropdown-menu'
import Link from 'next/link'
import { api } from '@web/trpc/react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  ChevronsUpDown,
  ClipboardPlus,
  ClipboardList,
  LogOut,
  House,
  ShieldPlus,
  CircleUserRound,
} from 'lucide-react'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  <SidebarMenuButton tooltip={item.title}>
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

function NavUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const [doctor] = api.doctors.currentDoctor.useSuspenseQuery()

  const { mutateAsync } = api.doctors.signOut.useMutation()
  const utils = api.useUtils()

  const handleSignout = async () => {
    await mutateAsync()
    await utils.users.currentUser.refetch()
    await utils.invalidate()
    router.push('/')
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
                  src={doctor?.user?.profilePicture?.url}
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
                    src={doctor?.user?.profilePicture?.url}
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
      url: '/upcomming-appointments',
      icon: House,
    },

    {
      title: 'Online Appointments',
      url: '/online-appointments',
      icon: ClipboardPlus,
    },
    {
      title: 'Physical Appointments',
      url: '/physical-appointments',
      icon: ClipboardList,
    },
    {
      title: 'Patients',
      url: '/patients',
      icon: ShieldPlus,
    },
    {
      title: 'Profile',
      url: '/profile',
      icon: CircleUserRound,
    },
  ],
}
