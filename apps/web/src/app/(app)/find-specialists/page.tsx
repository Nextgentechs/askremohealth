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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    specialty?: string
    subSpecialties?: string
    genders?: string
    query?: string
    town?: string
    page?: string
  }>
}) {
  const { specialty, subSpecialties, genders, query, town, page } =
    await searchParams
  const data = await api.doctors.list({
    specialty: specialty ?? undefined,
    subSpecialties: subSpecialties ? subSpecialties.split(',') : undefined,
    genders: genders
      ? genders.split(',').map((g) => g as 'male' | 'female')
      : undefined,
    query: query ?? undefined,
    town: town ?? undefined,
    page: page ? Number(page) : undefined,
    limit: 10,
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
    </main>
  )
}
