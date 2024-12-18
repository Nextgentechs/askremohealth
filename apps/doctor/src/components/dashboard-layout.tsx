import React from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { Outlet } from '@tanstack/react-router'
import { Separator } from './ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from './ui/breadcrumb'
import { Button } from './ui/button'
import { BellDot, Moon } from 'lucide-react'

function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 flex-row items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 px-4">
        <Button variant={'ghost'} size={'icon'} className="rounded-full">
          <BellDot className="" />
        </Button>
        <Button variant={'ghost'} size={'icon'} className="rounded-full">
          <Moon />
        </Button>
      </div>
    </header>
  )
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col gap-4">
        <DashboardHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
