'use client'

import { CalendarClock, Check, Loader, Video, X } from 'lucide-react'

import { useToast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
import { useRouter } from 'next-nprogress-bar'
import { Button } from './ui/button'

export function PendingAppointmentActions({
  appointmentId,
}: {
  appointmentId: string
  doctorId: string
}) {
  const utils = api.useUtils()
  const { toast } = useToast()
  const router = useRouter()
  const { mutateAsync: cancelAppointment } =
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
    utils.users.listAppointments.invalidate()
    router.refresh()
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size={'sm'}
        className=" text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleCancelAppointment}
      >
        <X className="  size-4" />
        Cancel
      </Button>
      <Button
        size={'sm'}
        disabled
        variant="outline"
        className="border-primary "
      >
        <CalendarClock className="size-4" />
        Reschedule
      </Button>
    </div>
  )
}

export function VideoAppointmentActions({
  appointmentId,
}: {
  appointmentId: string
}) {
  const utils = api.useUtils()
  const { toast } = useToast()
  const router = useRouter()

  const { mutateAsync: cancelAppointment } =
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

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size={'sm'}
        onClick={() => router.push(`/appointments/${appointmentId}/video`)}
      >
        <Video className="size-4" />
        Join Meeting
      </Button>
      <Button
        variant="outline"
        size={'sm'}
        className=" text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={async () => {
          await cancelAppointment(appointmentId)
          utils.users.listAppointments.invalidate()
          router.refresh()
        }}
      >
        <X className="size-4" />
        Cancel
      </Button>
    </div>
  )
}
