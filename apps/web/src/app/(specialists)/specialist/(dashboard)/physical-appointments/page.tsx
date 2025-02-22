import { DataTable } from '@web/components/data-table'
import { type AppointmentStatus } from '@web/server/utils'
import { api } from '@web/trpc/server'
import AppointmentFilters from '../online-appointments/_components/appointment-filters'
import { appointmentsColumns } from '../upcoming-appointments/_components/upcomming-appointments-columns'

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{
    status: string
    patientId: string
    page: string
  }>
}) {
  const { status, patientId, page } = await searchParams

  const data = await api.doctors.allAppointments({
    type: 'physical',
    page: page ? parseInt(page) : 1,
    pageSize: 10,
    patientId: patientId || undefined,
    status: status as AppointmentStatus,
  })
  return (
    <div className="mb-20 flex flex-col gap-8 md:mt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-wide text-foreground">
          Physical Appointments
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage all your previous and upcomming physical appointments here
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <AppointmentFilters />
        <DataTable columns={appointmentsColumns} data={data.appointments} />
      </div>
    </div>
  )
}
