import React, { Suspense } from 'react'
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
import { BellDot } from 'lucide-react'
import { useRouterState } from '@tanstack/react-router'
import { ModeToggle } from './mode-toggle'

function DashboardHeader() {
  const routerState = useRouterState()

  const pathSegments = routerState.resolvedLocation.pathname
    .split('/')
    .filter(Boolean)

  const formattedPaths = pathSegments.map((segment) =>
    segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  )

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
        <Button
          variant={'ghost'}
          size={'icon'}
          className="rounded-full"
          asChild
        >
          <ModeToggle />
        </Button>
      </div>
    </header>
  )
}

function ProgressBar() {
  return (
    <div className="mx-auto flex h-[90vh] w-screen max-w-md flex-row items-center justify-center">
      <div className="relative h-1 w-full overflow-hidden bg-gray-300">
        <div className="bg-primary animate-streaming-progress absolute left-0 top-0 h-full w-1/2"></div>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col gap-4">
        <DashboardHeader />
        <div className="container mx-auto mb-10 max-w-6xl flex-1">
          <Suspense fallback={<ProgressBar />}>
            <Outlet />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
