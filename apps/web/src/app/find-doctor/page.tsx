import DoctorCard from '@web/components/doctor-card'
import DoctorFilters from '@web/components/doctor-filters'
import { SearchForm } from '@web/components/hero-section'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@web/components/ui/pagination'
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

        <div className="flex w-full flex-col gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <DoctorCard key={index} />
          ))}

          <Pagination className="py-5">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </main>
  )
}
