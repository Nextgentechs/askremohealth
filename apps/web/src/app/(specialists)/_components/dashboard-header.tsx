'use client'

import { BellDot } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import { Button } from '@web/components/ui/button'
import { Separator } from '@web/components/ui/separator'
import { SidebarTrigger } from '@web/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { ModeToggle } from '@web/components/mode-toggle'

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
