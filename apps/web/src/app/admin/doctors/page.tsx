import React from 'react'
import { api } from '@web/trpc/server'
import { DataTable } from '@web/components/data-table'
import { DoctorsColumns, DoctorsPagination } from './doctors-table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'

export default async function Page() {
  const doctors = await api.admin.getDoctors({ page: 1, limit: 10 });


  console.log(doctors)


  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Doctors</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
    </div>
  )
}
