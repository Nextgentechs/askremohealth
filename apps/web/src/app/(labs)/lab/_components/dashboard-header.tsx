'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import { Separator } from '@web/components/ui/separator'
import { SidebarTrigger } from '@web/components/ui/sidebar'
import { usePathname } from 'next/navigation'

export default function DashboardHeader() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)
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
        <Breadcrumb className="hidden md:block">
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
    </header>
  )
}
