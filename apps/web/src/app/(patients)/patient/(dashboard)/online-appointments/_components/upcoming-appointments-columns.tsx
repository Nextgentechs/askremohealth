'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@web/components/ui/badge'
import { format } from 'date-fns'
import { type RouterOutputs } from '@web/trpc/react'

// Appointment type for patient
// RouterOutputs['users']['listAppointments']['appointments'][number]
type Appointment = RouterOutputs['users']['listAppointments']['appointments'][number]

export const appointmentsColumns: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'appointmentDate',
    header: 'Appointment Date',
    accessorFn: (row) => {
      return format(row.appointmentDate, 'MMM dd, yyyy hh:mm a')
    },
  },
  {
    accessorKey: 'doctor.user.firstName',
    header: 'Doctor Name',
    accessorFn: (row) => {
      return `${row.doctor.user.firstName} ${row.doctor.user.lastName}`
    },
  },
  {
    accessorKey: 'doctor.specialty.name',
    header: 'Specialty',
    accessorFn: (row) => {
      return row.doctor.specialty?.name ?? 'N/A'
    },
  },
  {
    accessorKey: 'doctor.facility.name',
    header: 'Facility',
    accessorFn: (row) => {
      return row.doctor.facility?.name ?? 'N/A'
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    accessorFn: (row) => {
      return row.type.charAt(0).toUpperCase() + row.type.slice(1)
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      const statusStr = typeof status === 'string' ? status : ''
      // Define allowed badge variants
      type BadgeVariant =
        | 'scheduled'
        | 'pending'
        | 'completed'
        | 'cancelled'
        | 'rescheduled'
        | 'missed'
        | 'in_progress'
        | 'default'
        | 'secondary'
        | 'destructive'
        | 'outline'
        | null
        | undefined
      return (
        <Badge variant={statusStr as BadgeVariant}>
          {statusStr.charAt(0).toUpperCase() + statusStr.slice(1).replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'patientNotes',
    header: 'Your Notes',
    accessorFn: (row) => {
      return row.patientNotes ?? 'No notes'
    },
  },
] 