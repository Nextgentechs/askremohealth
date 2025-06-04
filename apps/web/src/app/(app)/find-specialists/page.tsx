import DoctorFilters from '@web/components/doctor-filters'
import DoctorList from '@web/components/doctor-list'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@web/components/ui/breadcrumb'
import { api } from '@web/trpc/server'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import SearchForm from './_components/search-form'
import { ChatBot } from '@web/components/chat-bot'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    specialty?: string
    county?: string
    town?: string
    query?: string
    page?: string
  }>
}) {
  const { specialty, county, town, query } = await searchParams

  const data = await api.doctors.searchByLocation({
    specialtyId: specialty,
    countyCode: county,
    townId: town,
    query: query,
  })

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
      <div className="block">
        <SearchForm />
      </div>

      <div className="mb-10 w-full flex flex-col lg:flex-row gap-10 2xl:px-2">
        <DoctorFilters />
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center pt-40 justify-center">
              <Loader2 className="animate-spin" size={48} />
            </div>
          }
        >
          <DoctorList data={data} />
        </Suspense>
      </div>
      <ChatBot/>
    </main>
  )
}
