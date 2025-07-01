'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@web/components/ui/badge'
import { Button } from '@web/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu'
import { toast } from '@web/hooks/use-toast'
import { AppointmentStatus } from '@web/server/api/validators'
import { api, type RouterOutputs } from '@web/trpc/react'
import { format } from 'date-fns'
import {
  Check,
  Loader,
  MoreHorizontal,
  Video,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Appointment =
  RouterOutputs['users']['listAppointments']['appointments'][number]

export const appointmentsColumns: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'appointmentDate',
    header: 'Appointment Date',
    accessorFn: (row) => {
      return format(new Date(row.appointmentDate), 'MMM dd, yyyy hh:mm a')
    },
  },
  {
    accessorKey: 'doctor.user.firstName',
    header: 'Doctor Name',
    accessorFn: (row) => {
      return `Dr. ${row.doctor.user.firstName} ${row.doctor.user.lastName}`
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
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const status = row.getValue('status') as AppointmentStatus
      return (
        <Badge variant={status}>
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
      )
    },
  },

  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const status = row.getValue('status') as AppointmentStatus
      if (
        status === AppointmentStatus.Scheduled ||
        status === AppointmentStatus.InProgress
      ) {
        return <ScheduledAppointmentActions row={row.original} />
      }
      return null
    },
  },
]

function ScheduledAppointmentActions({ row }: { row: Appointment }) {
  const utils = api.useUtils()
  const router = useRouter()

  const { mutateAsync: cancelAppointment, isPending: isCancelling } =
    api.users.cancelAppointment.useMutation({
      onMutate: () => {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Cancelling appointment...</span>
            </div>
          ),
        })
      },
      onSuccess: () => {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Appointment successfully cancelled</span>
            </div>
          ),
        })
      },
      onError: () => {
        toast({
          variant: 'destructive',
          description: (
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>Failed to cancel appointment</span>
            </div>
          ),
        })
      },
    })

  const handleCancelAppointment = async () => {
    try {
      await cancelAppointment(row.id)
      await utils.users.listAppointments.refetch()
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/appointments/${row.id}/video`}>
            <Video className="mr-2 h-4 w-4" /> Join Call
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCancelAppointment}
          disabled={isCancelling}
          className="text-red-500"
        >
          <X className="mr-2 h-4 w-4" /> Cancel Appointment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
