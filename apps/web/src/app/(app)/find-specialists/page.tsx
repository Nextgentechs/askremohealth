import { ChatBot } from '@web/components/chat-bot'
import DoctorFilters from '@web/components/doctor-filters'
import DoctorList from '@web/components/doctor-list'
import Footer from '@web/components/footer'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
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
    county?: string
    query?: string
    page?: string
    experience?: string
    gender?: string
  }>
}) {
  const { specialty, subSpecialties, county, query, experience, gender } = await searchParams

  // Parse experience ranges from URL parameter
  const experiences = experience
    ? experience.split(',').map((exp) => {
        if (exp === '15+') {
          return { min: 15 }
        }
        const [minStr, maxStr] = exp.split('-')
        const min = parseInt(minStr ?? '0', 10)
        const max = maxStr ? parseInt(maxStr, 10) : undefined
        return { min, max }
      })
    : undefined

  // Parse genders from URL parameter
  const genders = gender
    ? gender.split(',').filter((g): g is 'male' | 'female' =>
        g === 'male' || g === 'female'
      )
    : undefined

  // Parse subSpecialties from URL parameter
  const subSpecialtiesArray = subSpecialties ? subSpecialties.split(',') : undefined

  const data = await api.doctors.searchByLocation({
    specialtyId: specialty,
    subSpecialties: subSpecialtiesArray,
    countyCode: county,
    townId: undefined, // Town filtering removed from frontend
    query: query,
    experiences: experiences,
    genders: genders,
  })

  return (
    <main>
      <div className="container mx-auto mt-12 flex min-h-screen w-full flex-col gap-12">
        <Breadcrumb className="lg:ps-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/find-specialists">Doctors</BreadcrumbLink>
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
        <ChatBot />
      </div>
      <Footer />
    </main>
  )
}
