import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs'
export default async function Appointments() {

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Appointments</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-wide text-foreground">
          Appointments
        </h1>
        <p className="text-sm text-muted-foreground">Manage all appointments here</p>
      </div>
      <div>
        <Tabs defaultValue="online" className="w-1/2">
          <TabsList className="flex flex-col sm:grid sm:grid-cols-2 mb-8 h-auto">
            <TabsTrigger
              className="justify-start text-start sm:justify-center sm:text-center"
              value="online"
            >
              Online Appointments
            </TabsTrigger>
            <TabsTrigger
              className="justify-start text-start sm:justify-center sm:text-center"
              value="physical"
            >
              Physical Appointments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="online">
            <p>online</p>
          </TabsContent>

          <TabsContent value="physical">
            <p>Physical</p>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
