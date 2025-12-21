'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
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
import { availabilityDetailsSchema } from '@web/server/api/validators'
import { api } from '@web/trpc/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

function OnlineStatus() {
  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <h4 className="text-sm">Online consultation status</h4>
        <p className="text-xs text-green-500">Available</p>
      </div>
      <Switch checked />
    </div>
  )
}

function PhysicalStatus() {
  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <h4 className="text-sm">Physical consultation status</h4>
        <p className="text-xs text-red-500">Unavailable</p>
      </div>
      <Switch checked />
    </div>
  )
}

export default function ConsultationSettings() {
  const { toast } = useToast()
  const { data: doctor, isLoading } = api.doctors.currentDoctor.useQuery()
  const utils = api.useUtils()
  const updateMutation = api.doctors.updateAvailabilityDetails.useMutation()

  const form = useForm<{
    consultationFee: string
    appointmentDuration: string
    operatingHours: {
      day: string
      opening: string
      closing: string
      isOpen: boolean
    }[]
  }>({
    resolver: zodResolver(availabilityDetailsSchema),
    defaultValues: {
      consultationFee: '',
      appointmentDuration: '',
      operatingHours: [
        { day: 'Monday', opening: '09:00', closing: '17:00', isOpen: true },
        { day: 'Tuesday', opening: '09:00', closing: '17:00', isOpen: true },
        { day: 'Wednesday', opening: '09:00', closing: '17:00', isOpen: true },
        { day: 'Thursday', opening: '09:00', closing: '17:00', isOpen: true },
        { day: 'Friday', opening: '09:00', closing: '17:00', isOpen: true },
        { day: 'Saturday', opening: '09:00', closing: '13:00', isOpen: true },
        { day: 'Sunday', opening: '00:00', closing: '00:00', isOpen: false },
      ],
    },
  })

  // Populate form with fetched data
  useEffect(() => {
    if (doctor?.consultationFee && doctor?.operatingHours?.[0]) {
      form.reset({
        consultationFee:
          doctor.consultationFee != null ? String(doctor.consultationFee) : '',
        appointmentDuration:
          doctor.operatingHours[0].consultationDuration != null
            ? String(doctor.operatingHours[0].consultationDuration)
            : '',
        operatingHours: (doctor.operatingHours[0].schedule ?? []).map(
          (d: {
            day: string
            opening: string | null
            closing: string | null
            isOpen: boolean
          }) => ({
            ...d,
            opening: d.opening ?? '',
            closing: d.closing ?? '',
          }),
        ),
      })
    }
  }, [doctor, form])

  const onSubmit = async (values: {
    consultationFee: string
    appointmentDuration: string
    operatingHours: {
      day: string
      opening: string
      closing: string
      isOpen: boolean
    }[]
  }) => {
    try {
      await updateMutation.mutateAsync({
        ...values,
        consultationFee: String(values.consultationFee),
        appointmentDuration: String(values.appointmentDuration),
        operatingHours: values.operatingHours.map((oh) => ({
          ...oh,
          day: oh.day as
            | 'Monday'
            | 'Tuesday'
            | 'Wednesday'
            | 'Thursday'
            | 'Friday'
            | 'Saturday'
            | 'Sunday',
        })),
      })
      toast({ description: 'Consultation settings updated!' })
      utils.doctors.currentDoctor.invalidate()
    } catch (_) {
      toast({
        description: 'Failed to update settings',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-4 gap-y-6">
        <OnlineStatus />
        <PhysicalStatus />
        <div className="flex flex-col gap-2">
          <Label> Consultation Fee (Ksh)</Label>
          <Input type="number" {...form.register('consultationFee')} />
        </div>
        <div>
          <Label htmlFor="appointmentDuration">
            Average Appointment Duration
          </Label>
          <Controller
            control={form.control}
            name="appointmentDuration"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
            )}
          />
        </div>
        <Controller
          control={form.control}
          name="operatingHours"
          render={({ field }) => (
            <Card className="shadow-none col-span-2">
              <CardHeader>
                <CardTitle>Consultation Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(
                    field.value as {
                      day: string
                      opening: string
                      closing: string
                      isOpen: boolean
                    }[]
                  ).map((dayHours, index) => (
                    <div
                      key={dayHours.day}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-24 text-sm">{dayHours.day}</div>
                      <Input
                        type="time"
                        value={dayHours.opening}
                        onChange={(event) => {
                          const updated = [...field.value]
                          if (updated[index])
                            updated[index].opening = event.target.value
                          field.onChange(updated)
                        }}
                        className="w-24"
                        disabled={!dayHours.isOpen}
                      />
                      <Input
                        type="time"
                        value={dayHours.closing}
                        onChange={(event) => {
                          const updated = [...field.value]
                          if (updated[index])
                            updated[index].closing = event.target.value
                          field.onChange(updated)
                        }}
                        className="w-24"
                        disabled={!dayHours.isOpen}
                      />
                      <Switch
                        checked={dayHours.isOpen}
                        onCheckedChange={(checked) => {
                          const updated = [...field.value]
                          if (updated[index]) updated[index].isOpen = checked
                          field.onChange(updated)
                        }}
                      />
                      <Label htmlFor={`${dayHours.day}-switch`} hidden>
                        Open
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        />
      </div>
      <CardFooter className="justify-end mt-4">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </form>
  )
}
