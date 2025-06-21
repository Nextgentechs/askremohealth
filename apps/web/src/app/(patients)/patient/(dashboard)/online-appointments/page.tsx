import { DataTable } from '@web/components/data-table'
import { api } from '@web/trpc/server'
import { appointmentsColumns } from '../upcoming-appointments/_components/upcoming-appointments-columns'
import { AppointmentStatus } from '@web/server/api/validators'
import AppointmentFilters from './_components/appointment-filters'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page } = await searchParams
  const data = await api.users.listAppointments({
    type: 'online',
    page: page ? parseInt(page) : 1,
    limit: 10,
    status: status ? (status as AppointmentStatus) : undefined,
  })
  return (
    <div className="mb-20 flex flex-col gap-8 md:mt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-wide text-foreground">
          Online Appointments
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage all your previous and upcoming online appointments here
        </p>
      </div>
      <div className="flex flex-col gap-8">
        <AppointmentFilters />
        <DataTable columns={appointmentsColumns} data={data.appointments} />
      </div>
    </div>
  )
}
