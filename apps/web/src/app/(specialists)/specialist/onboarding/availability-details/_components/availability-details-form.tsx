'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Card, CardContent } from '@web/components/ui/card'
import { Checkbox } from '@web/components/ui/checkbox'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select'
import { Switch } from '@web/components/ui/switch'
import { useToast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { z } from 'zod'

const operatingHoursSchema = z.object({
  day: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  opening: z.string(),
  closing: z.string(),
  isOpen: z.boolean(),
})
const availabilityDetailsSchema = z.object({
  consultationFee: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 500, {
      message: 'Consultation fee must be greater than Ksh.500',
    }),
  appointmentDuration: z.string().min(1, {
    message: 'Please enter an appointment duration',
  }),
  operatingHours: z.array(operatingHoursSchema),
})
type AvailabilityDetails = z.infer<typeof availabilityDetailsSchema>

const initialOperatingHours: AvailabilityDetails['operatingHours'] = [
  { day: 'Monday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Tuesday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Wednesday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Thursday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Friday', opening: '09:00', closing: '17:00', isOpen: true },
  { day: 'Saturday', opening: '09:00', closing: '13:00', isOpen: true },
  { day: 'Sunday', opening: '00:00', closing: '00:00', isOpen: false },
]

function FacilityHours() {
  const [editingDay, setEditingDay] = React.useState<string | null>(null)
  const { setValue, watch } = useFormContext<AvailabilityDetails>()

  const operatingHours = watch('operatingHours')

  const handleEdit = (day: string) => {
    setEditingDay(day === editingDay ? null : day)
  }

  const handleChange = (
    dayIndex: number,
    field: 'opening' | 'closing' | 'isOpen',
    value: string | boolean,
  ) => {
    const newHours = [...operatingHours]
    const currentDay = newHours[dayIndex]
    if (!currentDay) return

    newHours[dayIndex] = {
      day: currentDay.day,
      opening: currentDay.opening,
      closing: currentDay.closing,
      isOpen: currentDay.isOpen,
      [field]: value,
    }
    setValue('operatingHours', newHours, { shouldValidate: true })
  }

  return (
    <Card className="mx-auto w-full max-w-xl pt-6 shadow-none">
      <CardContent>
        <div className="space-y-2">
          {operatingHours.map((dayHours, index) => (
            <div key={dayHours.day} className="flex items-center space-x-4">
              <div className="w-24 text-sm">{dayHours.day}</div>
              {editingDay === dayHours.day ? (
                <div className="flex flex-1 flex-row gap-4">
                  <Input
                    type="time"
                    value={dayHours.opening}
                    onChange={(e) =>
                      handleChange(index, 'opening', e.target.value)
                    }
                    className="w-24"
                  />
                  <Input
                    type="time"
                    value={dayHours.closing}
                    onChange={(e) =>
                      handleChange(index, 'closing', e.target.value)
                    }
                    className="w-24"
                  />
                </div>
              ) : (
                <div className="flex-1 text-sm">
                  {dayHours.isOpen
                    ? `${dayHours.opening} - ${dayHours.closing}`
                    : 'Closed'}
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={dayHours.isOpen}
                  onCheckedChange={(checked) =>
                    handleChange(index, 'isOpen', checked)
                  }
                />
                <Label htmlFor={`${dayHours.day}-switch`} hidden>
                  Open
                </Label>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleEdit(dayHours.day)}
              >
                {editingDay === dayHours.day ? 'Save' : 'Edit'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AvailabilityDetailsForm() {
  const router = useRouter()

  const form = useForm<AvailabilityDetails>({
    resolver: zodResolver(availabilityDetailsSchema),
    defaultValues: {
      operatingHours: initialOperatingHours,
    },
    mode: 'onBlur',
  })
  const { toast } = useToast()

  const { mutateAsync: updateAvailabilityDetails } =
    api.doctors.updateAvailabilityDetails.useMutation({})

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await updateAvailabilityDetails(values)
      if (res.success) {
        router.push('/specialist/upcoming-appointments')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occurred',
        description: 'Please try again',
      })
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="consultationFee">Consultation Fee (Ksh.)</Label>
            <Input
              {...form.register('consultationFee')}
              id="consultationFee"
              type="number"
            />

            <p className="text-[0.8rem] font-medium text-destructive">
              {form.formState.errors.consultationFee?.message}
            </p>
          </div>

          <div>
            <Label htmlFor="appointmentDuration">
              Average Appointment Duration
            </Label>
            <Select
              onValueChange={(value) =>
                form.setValue('appointmentDuration', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.appointmentDuration && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.appointmentDuration.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Label htmlFor="operatingHours">Operating Hours</Label>
          <FormProvider {...form}>
            <FacilityHours />
          </FormProvider>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-4 border-t px-2 pt-4">
        <div className="flex flex-row items-start justify-start gap-1">
          <Checkbox required />
          <label
            htmlFor="terms"
            className="text-sm leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I confirm that I am a licensed medical practitioner and all
            information provided is accurate and up to date
          </label>
        </div>

        <div className="flex flex-row items-center justify-center gap-1">
          <Checkbox required />
          <label
            htmlFor="terms"
            className="text-sm leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I consent to credential verification and background checks
          </label>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-end border-t border-t-border bg-background px-6 py-4 sm:px-12">
        <Button size="lg" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            'Complete Registration'
          )}
        </Button>
      </div>
    </form>
  )
}
