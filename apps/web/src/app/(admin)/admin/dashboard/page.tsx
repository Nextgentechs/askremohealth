import { AppSidebar } from '@web/components/admin/app-sidebar'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  Breadcrumb,
} from '@web/components/ui/breadcrumb'
import { Separator } from '@web/components/ui/separator'

import { SidebarInset, SidebarTrigger } from '@web/components/ui/sidebar'
import { SidebarProvider } from '@web/components/ui/sidebar'
import React from 'react'

export default function page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col gap-4">
        <DashboardHeader />
        <div className="container mx-auto mb-10 max-w-6xl flex-1">
          <React.Suspense fallback={<ProgressBar />}>
            <div>Hello</div>
          </React.Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function ProgressBar() {
  return (
    <div className="mx-auto flex h-[90vh] w-screen max-w-md flex-row items-center justify-center">
      <div className="relative h-1 w-full overflow-hidden bg-gray-300">
        <div className="absolute left-0 top-0 h-full w-1/2 animate-streaming-progress bg-primary"></div>
      </div>
    </div>
  )
}

function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 flex-row items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
    </header>
  )
}
