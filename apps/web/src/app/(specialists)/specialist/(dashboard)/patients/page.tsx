import { DataTable } from '@web/components/data-table'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { api } from '@web/trpc/server'
import { SpecialistsPagination } from '../upcoming-appointments/_components/appointment-tabs'
import { patientsTableColumns } from './_components/patients-columns'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string
    page: string
  }>
}) {
  const { query, page } = await searchParams

  const data = await api.doctors.patients({
    query: query ?? '',
    page: page ? parseInt(page) : 1,
    limit: 10,
  })
  return (
    <div className="mb-20 flex flex-col gap-8 md:mt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-wide text-foreground">
          Patients
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage all your patients here
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="w-full max-w-72">
          <Label hidden className="sr-only">
            Patient
          </Label>
          <Input placeholder="Search patient..." />
        </div>
        <DataTable columns={patientsTableColumns} data={data.patients} />
        <SpecialistsPagination pagination={data.pagination} />
      </div>
    </div>
  )
}
