import { ColumnDef } from '@tanstack/react-table'
import { RouterOutputs } from '@web/server/api'
import { format } from 'date-fns'
import { Badge } from '../ui/badge'
import { AppointmentStatus } from '../../../../web/src/server/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import {
  CheckCircle,
  MoreHorizontal,
  XCircle,
  Loader,
  Check,
  X,
  Video,
} from 'lucide-react'
import { api } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

type Appointment =
  RouterOutputs['doctors']['upcommingAppointments']['appointments'][number]

export const upcommingAppointmentsColumn: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'appointmentDate',
    header: 'Appointment Date',
    accessorFn: (row) => {
      return format(row.appointmentDate, 'MMM dd, yyyy hh:mm a')
    },
  },
  {
    accessorKey: 'patient.user.firstName',
    header: 'Patient Name',
    accessorFn: (row) => {
      return `${row.patient.user.firstName} ${row.patient.user.lastName}`
    },
  },
  {
    accessorKey: 'patient.user.phone',
    header: 'Phone Number',
  },
  {
    accessorKey: 'notes',
    header: 'Reason for visit',
    accessorFn: (row) => {
      return row.patientNotes || 'No notes'
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
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
      const status = row.getValue('status') as AppointmentStatus
      if (status === AppointmentStatus.PENDING) {
        return <PendingAppointmentActions appointmentId={row.original.id} />
      }
      if (
        status === AppointmentStatus.SCHEDULED ||
        status === AppointmentStatus.IN_PROGRESS
      ) {
        return <ScheduledAppointmentActions row={row.original} />
      }
      return null
    },
  },
]

function PendingAppointmentActions({
  appointmentId,
}: {
  appointmentId: string
}) {
  const { toast } = useToast()
  const utils = api.useUtils()
  const router = useRouter()

  const { mutateAsync: confirmAppointment, isPending: isConfirming } =
    api.doctors.confirmAppointment.useMutation({
      onMutate: () => {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Confirming appointment...</span>
            </div>
          ),
        })
      },
      onSuccess: () => {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Appointment successfully confirmed</span>
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
              <span>Failed to confirm appointment</span>
            </div>
          ),
        })
      },
    })

  const { mutateAsync: declineAppointment, isPending: isDeclining } =
    api.doctors.declineAppointment.useMutation({
      onMutate: () => {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Declining appointment...</span>
            </div>
          ),
        })
      },
      onSuccess: () => {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Appointment successfully declined</span>
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
              <span>Failed to decline appointment</span>
            </div>
          ),
        })
      },
    })

  const handleConfirmAppointment = async () => {
    try {
      await confirmAppointment({ appointmentId })
      router.invalidate()
      await utils.doctors.upcommingAppointments.refetch()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeclineAppointment = async () => {
    try {
      await declineAppointment({ appointmentId })
      router.invalidate()
      await utils.doctors.upcommingAppointments.refetch()
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
        <DropdownMenuItem
          onClick={handleConfirmAppointment}
          disabled={isConfirming}
        >
          <CheckCircle className="size-5" />
          Confirm Consultation
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeclineAppointment}
          disabled={isDeclining}
        >
          <XCircle className="size-5" />
          Decline Request
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ScheduledAppointmentActions({
  row,
}: {
  row: RouterOutputs['doctors']['upcommingAppointments']['appointments'][number]
}) {
  const { toast } = useToast()
  const utils = api.useUtils()
  const router = useRouter()

  const { mutateAsync: cancelAppointment, isPending: isCancelling } =
    api.doctors.cancelAppointment.useMutation({
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
      await cancelAppointment({ appointmentId: row.id })
      await utils.doctors.upcommingAppointments.refetch()
      router.invalidate()
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
        {row.type === 'online' && (
          <Link to={'/appointment-room/$id'} params={{ id: row.id }}>
            <DropdownMenuItem>
              <Video className="mr-2 h-4 w-4" />
              Start Consultation
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuItem
          onClick={handleCancelAppointment}
          disabled={isCancelling}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel Consultation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
