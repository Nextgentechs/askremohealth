import { type ColumnDef } from '@tanstack/react-table'
import { type RouterOutputs } from '@web/trpc/react'

type Patient = RouterOutputs['doctors']['patients']['patients'][number]

export const patientsTableColumns: ColumnDef<Patient>[] = [
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
