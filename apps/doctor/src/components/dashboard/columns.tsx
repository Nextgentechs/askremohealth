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
  Loader2,
  Loader,
  Check,
  X,
} from 'lucide-react'
import { api } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from '@tanstack/react-router'

type Appointment =
  RouterOutputs['appointments']['doctor']['upcomming']['appointments'][number]

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
      return row.notes || 'No notes'
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
    cell: ({ row }) => <ColumnActions appointmentId={row.original.id} />,
  },
]

const ColumnActions = ({ appointmentId }: { appointmentId: string }) => {
  const { toast } = useToast()
  const utils = api.useUtils()
  const router = useRouter()

  const { mutateAsync: confirmAppointment, isPending: isConfirming } =
    api.appointments.doctor.confirmAppointment.useMutation({
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
              <span>Appointment confirmed successfully</span>
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
    api.appointments.doctor.declineAppointment.useMutation({
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
              <span>Appointment declined successfully</span>
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
      await utils.appointments.doctor.upcomming.refetch()
      router.invalidate()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeclineAppointment = async () => {
    try {
      await declineAppointment({ appointmentId })
      await utils.appointments.doctor.upcomming.refetch()
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
        <DropdownMenuItem
          onClick={handleConfirmAppointment}
          disabled={isConfirming}
        >
          {isConfirming ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CheckCircle className="size-5" />
          )}
          {isConfirming ? 'Confirming...' : 'Confirm Consultation'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeclineAppointment}
          disabled={isDeclining}
        >
          {isDeclining ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <XCircle className="size-5" />
          )}
          {isDeclining ? 'Declining...' : 'Decline Request'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
