'use client'

import { Check, Loader, MoreHorizontal, Video, X } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu'
import { Button } from './ui/button'
import { api } from '@web/trpc/react'
import { useToast } from '@web/hooks/use-toast'
import Link from 'next/link'
import { useRouter } from 'next-nprogress-bar'

export function PendingAppointmentActions({
  appointmentId,
  doctorId,
}: {
  appointmentId: string
  doctorId: string
}) {
  const utils = api.useUtils()
  const { toast } = useToast()
  const router = useRouter()
  const { mutateAsync: cancelAppointment, isPending: cancelPending } =
    api.appointments.patients.cancel.useMutation({
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
              <span>Appointment cancelled successfully</span>
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
    await cancelAppointment(appointmentId)
    utils.appointments.patients.list.invalidate()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={handleCancelAppointment}
          disabled={cancelPending}
        >
          Cancel Appointment
        </DropdownMenuItem>
        <DropdownMenuItem>Reschedule Appointment</DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={`/doctors/${doctorId}`}>View Doctor Profile</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function VideoAppointmentActions({
  appointmentId,
  doctorId,
}: {
  appointmentId: string
  doctorId: string
}) {
  const utils = api.useUtils()
  const { toast } = useToast()
  const router = useRouter()

  const handleJoinMeeting = () => {
    router.push(`/appointments/${appointmentId}/video`)
  }

  const { mutateAsync: cancelAppointment, isPending: cancelPending } =
    api.appointments.patients.cancel.useMutation({
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
              <span>Appointment cancelled successfully</span>
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
    await cancelAppointment(appointmentId)
    utils.appointments.patients.list.invalidate()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleJoinMeeting}>
          <Video className="mr-2 h-4 w-4" />
          Join Meeting
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCancelAppointment}
          disabled={cancelPending}
        >
          Cancel Appointment
        </DropdownMenuItem>
        <DropdownMenuItem>Reschedule Appointment</DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={`/doctors/${doctorId}`}>View Doctor Profile</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
