'use client'
import { type ColumnDef } from '@tanstack/react-table'
import { type RouterOutputs } from '@web/trpc/react'
import { format } from 'date-fns'

type Patient = RouterOutputs['doctors']['patients']['patients'][number]

export const patientsTableColumns: ColumnDef<Patient>[] = [
  {
    accessorKey: 'name',
    header: 'Patient Name',
  },
  {
    accessorKey: 'lastAppointment',
    header: 'Last Appointment Date',
    accessorFn: (row) => {
      if (!row.lastAppointment) return 'N/A'
      return format(row.lastAppointment, 'MMM dd, yyyy hh:mm a')
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone Number',
  },
  {
    accessorKey: 'email',
    header: 'Email Address',
  },
]
