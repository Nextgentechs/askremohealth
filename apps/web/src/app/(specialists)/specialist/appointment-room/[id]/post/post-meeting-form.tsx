'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { Textarea } from '@web/components/ui/textarea'
import { useToast } from '@web/hooks/use-toast'
import { fileToBase64 } from '@web/lib/utils'
import { api } from '@web/trpc/react'
import { Loader } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const postAppointmentSchema = z.object({
  patientName: z.string().optional(),
  appointmentDate: z.string().optional(),
  notes: z.string().min(10, { message: 'Please add a note' }),
  attachment: z.string().optional(),
})

export default function PostMeetingForm() {
  const { id } = useParams()
  const { toast } = useToast()
  const router = useRouter()

  const [appointment] = api.doctors.appointmentDetails.useSuspenseQuery({
    appointmentId: id as string,
  })

  const { register, handleSubmit, setValue, reset } = useForm<
    z.infer<typeof postAppointmentSchema>
  >({
    resolver: zodResolver(postAppointmentSchema),
    defaultValues: {
      patientName: `${appointment?.patient?.user?.firstName} ${appointment?.patient?.user?.lastName}`,
      appointmentDate: appointment?.appointmentDate
        ? new Date(appointment.appointmentDate)
            .toLocaleString('en-US', {
              timeZone: 'Africa/Nairobi',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
            .replace(',', '')
        : '',
      notes: appointment?.patientNotes ?? '',
      attachment: '',
    },
  })

  const { mutateAsync, isPending } = api.doctors.postAppointment.useMutation()

  const onSubmit = async (data: z.infer<typeof postAppointmentSchema>) => {
    await mutateAsync({
      appointmentId: id as string,
      doctorNotes: data.notes,
      attachment: data.attachment,
    })
    toast({
      title: 'Success',
      description: 'Follow-up notes succesfully sent',
    })
    reset()
    router.push('/specialist/upcoming-appointments')
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-xl w-full flex-col gap-6 mt-8"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="patientName">Patient Name</Label>
        <Input type="text" id="patientName" {...register('patientName')} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="appointmentDate">Appointment Date</Label>
        <Input
          type="text"
          id="appointmentDate"
          {...register('appointmentDate')}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          className="h-40"
          id="notes"
          {...register('notes')}
          placeholder="Add any important notes here"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="attachment">Attachment</Label>
        <Input
          type="file"
          id="attachment"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) {
              try {
                const base64String = await fileToBase64(file)
                setValue('attachment', base64String)
              } catch (error) {
                console.error('Error converting file to base64:', error)
              }
            }
          }}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          {isPending ? (
            <Loader className="animate-spin" />
          ) : (
            <span>Submit</span>
          )}
        </Button>
      </div>
    </form>
  )
}
