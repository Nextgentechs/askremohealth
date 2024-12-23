import { DataTable } from '@/components/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-dropdown-menu'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { ColumnDef } from '@tanstack/react-table'
import { RouterOutputs } from '@web/server/api'
import { z } from 'zod'

const patientsFilters = z.object({
  page: z.number().int().positive().catch(1),
  pageSize: z.number().int().catch(10),
})

export const Route = createFileRoute('/dashboard/patients')({
  validateSearch: patientsFilters,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, context: { trpcQueryUtils } }) => {
    const loaderData =
      await trpcQueryUtils.appointments.doctor.patients.ensureData(search)
    return loaderData
  },
  component: RouteComponent,
})

type Patient = RouterOutputs['appointments']['doctor']['patients'][number]

const patientsTableColumns: ColumnDef<Patient>[] = [
  {
    accessorKey: 'name',
    header: 'Patient Name',
  },
  {
    accessorKey: 'lastAppointment',
    header: 'Last Appointment Date',
  },
  {
    accessorKey: 'phone',
    header: 'Phone Number',
  },
  {
    accessorKey: 'email',
    header: 'Email Address',
  },
  {
    accessorKey: 'dob',
    header: 'Date of Birth',
  },
]

function RouteComponent() {
  const loaderData = useLoaderData({ from: '/dashboard/patients' })
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-wide">
          Patients
        </h1>
        <p className="text-muted-foreground text-sm">
          View and manage all your patients here
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="w-full max-w-72">
          <Label hidden className="sr-only">
            Patient
          </Label>
          <Input placeholder="Search patient..." />
        </div>
        <DataTable columns={patientsTableColumns} data={loaderData} />
      </div>
    </div>
  )
}
