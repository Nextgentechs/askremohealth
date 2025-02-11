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

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>
}) {
  const pageParam = Number((await searchParams).page)
  const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1

  const data = await api.admin.getDoctors({
    page,
    limit: 15,
  })
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

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-wide text-foreground">
          Doctors
        </h1>
        <p className="text-sm text-muted-foreground">Manage all doctors here</p>
      </div>
      <DataTable columns={DoctorsColumns} data={data.data} />
      <DoctorsPagination pagination={data.pagination} />
    </div>
  )
}
