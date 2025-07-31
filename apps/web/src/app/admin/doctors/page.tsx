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
  const { data: doctors, pagination } = await api.admin.getDoctors({ page: 1, limit: 10 });

  return (
    <div className="flex flex-col gap-8">

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Doctors</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>


      <DataTable columns={DoctorsColumns} data={doctors} />


      <DoctorsPagination pagination={pagination} />
    </div>
  )
}
