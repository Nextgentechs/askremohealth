import React, { useMemo } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { Outlet } from '@tanstack/react-router'
import { Separator } from './ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { Button } from './ui/button'
import { BellDot, Moon } from 'lucide-react'
import { useRouterState } from '@tanstack/react-router'

function DashboardHeader() {
  const routerState = useRouterState()
  const pathSegments = useMemo(() => {
    return routerState.location.pathname.split('/').filter(Boolean)
  }, [routerState.location.pathname])

  const formattedPaths = useMemo(() => {
    return pathSegments.map((segment) =>
      segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    )
  }, [pathSegments])

  return (
    <header className="flex h-16 shrink-0 flex-row items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {formattedPaths.map((path, index) => (
              <div key={index} className="inline-flex items-center gap-1.5">
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{path}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 px-4">
        <Button variant={'ghost'} size={'icon'} className="rounded-full">
          <BellDot />
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
        <div className="container mx-auto mt-4 max-w-6xl flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
