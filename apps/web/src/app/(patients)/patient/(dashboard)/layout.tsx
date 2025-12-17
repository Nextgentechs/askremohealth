import { SidebarInset, SidebarProvider } from '@web/components/ui/sidebar'
import React, { Suspense } from 'react'
import { AppSidebar } from '../../_components/app-sidebar'
import DashboardHeader from '../../_components/dashboard-header'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col gap-4">
        <DashboardHeader />
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="container mx-auto mb-10 max-w-6xl flex-1"
        >
          <Suspense fallback={<ProgressBar />}>{children}</Suspense>
        </main>
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
