import { DataTable } from '@/components/data-table'
import { DateRangePicker } from '@/components/date-range-picker'
import { FacetedFilter } from '@/components/faceted-filters'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createFileRoute,
  useLoaderData,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import { ColumnDef } from '@tanstack/react-table'
import { RouterOutputs } from '@web/server/api'
import { z } from 'zod'

export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Rescheduled = 'rescheduled',
  Missed = 'missed',
  InProgress = 'in_progress',
}

const appointmentsSchema = z.object({
  type: z.enum(['physical', 'online']).catch('physical'),
  patientId: z.string().optional().catch(undefined),
  startDate: z.coerce
    .date()
    .optional()
    .default(() => {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 1)
      return date
    }),
  endDate: z.coerce
    .date()
    .optional()
    .default(() => new Date()),
  status: z.nativeEnum(AppointmentStatus).optional().catch(undefined),
})

export const Route = createFileRoute('/dashboard/physical-appointments')({
  validateSearch: appointmentsSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, context: { trpcQueryUtils } }) => {
    const loaderData =
      await trpcQueryUtils.appointments.doctor.listAll.ensureData(search)
    return loaderData
  },
  component: RouteComponent,
})

const appointmentStatusOptions = Object.values(AppointmentStatus).map(
  (status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: status as AppointmentStatus,
  }),
)

function Filters() {
  const handleFilterChange = (values: string[]) => {
    console.log(values)
  }
  const searchParams = useSearch({ from: '/dashboard/physical-appointments' })
  const navigate = useNavigate({ from: '/dashboard/physical-appointments' })
  return (
    <div>
      <div className="flex w-full flex-row justify-between">
        <div className="flex flex-row items-center gap-4">
          <div className="w-full max-w-72">
            <Label hidden className="sr-only">
              Patient
            </Label>
            <Input placeholder="Search patient..." />
          </div>
          <FacetedFilter
            onFilterChange={handleFilterChange}
            title="Status"
            options={appointmentStatusOptions}
          />
        </div>

        <DateRangePicker
          from={searchParams.startDate}
          to={searchParams.endDate}
          onDateChange={(range) => {
            navigate({ search: { startDate: range.from, endDate: range.to } })
          }}
        />
      </div>
    </div>
  )
}

function RouteComponent() {
  const loaderData = useLoaderData({
    from: '/dashboard/physical-appointments',
  })
  return (
    <div className="flex flex-col gap-4">
      <Filters />
      <DataTable columns={columns} data={loaderData} />
    </div>
  )
}

type PhysicalAppointment =
  RouterOutputs['appointments']['doctor']['listAll'][number]

const columns: ColumnDef<PhysicalAppointment>[] = [
  {
    accessorKey: 'appointmentDate',
    header: 'Appointment Date',
  },
  {
    accessorKey: 'patient.user.firstName',
    header: 'Patient Name',
  },
  {
    accessorKey: 'patient.user.phone',
    header: 'Phone Number',
  },
  {
    accessorKey: 'notes',
    header: 'Reason for visit',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
]
