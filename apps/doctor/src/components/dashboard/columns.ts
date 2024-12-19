import { ColumnDef } from '@tanstack/react-table'
import { RouterOutputs } from '@web/server/api'

type Appointment = RouterOutputs['appointments']['doctor']['upcomming'][number]

export const upcommingAppointmentsColumn: ColumnDef<Appointment>[] = [
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
