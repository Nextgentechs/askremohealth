import DoctorFilters from '@web/components/doctor-filters'
import DoctorList from '@web/components/doctor-list'
import { SearchForm } from '@web/components/search-form'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import React from 'react'

export default function FindDoctor() {
  return (
    <main className="container mx-auto mt-12 flex min-h-screen w-full flex-col gap-12">
      <Breadcrumb className="lg:ps-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Doctors</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="hidden lg:block">
        <SearchForm />
      </div>

      <div className="mb-10 flex flex-row gap-10 2xl:px-2">
        <DoctorFilters />

        <DoctorList />
      </div>
    </main>
  )
}
