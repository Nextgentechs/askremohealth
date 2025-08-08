'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@web/hooks/use-toast'
import { combineDateTime, formatMoney, getTimeRange } from '@web/lib/utils'
import { api } from '@web/trpc/react'
import { CalendarIcon, Check, ClockIcon, Loader } from 'lucide-react'
import { useRouter, useSearchParams, redirect, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { z } from 'zod'
import AppointmentConfirmation from './appointment-confirmation'
import DoctorDetails from './doctor-details'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Textarea } from './ui/textarea'

function DoctorCard() {
  const { id } = useParams<{ id: string }>()
  const [doctorDetails] = api.doctors.details.useSuspenseQuery(id)

  if (!doctorDetails) return null
  return (
    <Card
      key={doctorDetails.id}
      className="hidden p-6 h-fit w-full max-w-md flex-col justify-between gap-8 rounded-xl border shadow-sm transition-all duration-300 sm:flex-row lg:flex lg:flex-row xl:max-w-lg 2xl:max-w-xl"
    >
      <div className="flex flex-1 flex-row gap-5 md:gap-8 xl:gap-10">
        <Avatar className="hidden md:block md:size-28">
          <AvatarImage src={doctorDetails.profilePicture?.url} />
          <AvatarFallback>
            {doctorDetails.user?.firstName?.charAt(0)}
            {doctorDetails.user?.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <DoctorDetails doctor={{
          ...doctorDetails,
          bookedSlots: []
        }} />
      </div>
    </Card>
  )
}

function AppointmentType() {
  const { setValue } = useFormContext<z.infer<typeof appointmentSchema>>()
  return (
    <Card className="rounded-xl p-6 border shadow-sm">
      <RadioGroup
        defaultValue="online"
        className="flex flex-col justify-between gap-4 sm:flex-row"
        onValueChange={(value) => {
          setValue('appointmentType', value as 'physical' | 'online')
        }}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="physical" id="physical" />
          <Label htmlFor="physical" className="cursor-pointer">
            Physical Appointment
          </Label>
        </div>

        <div className="flex flex-row items-center space-x-2">
          <RadioGroupItem value="online" id="online" />
          <Label htmlFor="online" className="cursor-pointer">
            Online Appointment
          </Label>
        </div>
      </RadioGroup>
    </Card>
  )
}

function PatientInformation() {
  const {
    register,
    formState: { errors },
  } = useFormContext<z.infer<typeof appointmentSchema>>()

  return (
    <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold md:text-xl">
          Patient Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid w-full gap-6 pt-6 text-foreground sm:grid-cols-2">
        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="firstName">
            First Name
          </Label>
          <Input
            {...register('firstName')}
            id="firstName"
            placeholder="Enter first name"
            className="ps-4"
          />
          {errors.firstName && (
            <span className="text-sm font-medium text-destructive">
              {errors.firstName.message}
            </span>
          )}
        </div>
        <div className="flex w-full flex-1 flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="lastName">
            Last Name
          </Label>
          <Input
            {...register('lastName')}
            id="lastName"
            placeholder="Enter last name"
            className="ps-4"
          />
          {errors.lastName && (
            <span className="text-sm font-medium text-destructive">
              {errors.lastName.message}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="phoneNumber">
            Phone Number
          </Label>
          <Input
            {...register('phone')}
            id="phoneNumber"
            type="tel"
            placeholder="Enter phone number"
            className="ps-4"
          />
          {errors.phone && (
            <span className="text-sm font-medium text-destructive">
              {errors.phone.message}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="email">
            Email Address
          </Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="Enter email address"
            className="ps-4"
          />
          {errors.email && (
            <span className="text-sm font-medium text-destructive">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="dob">
            Date of Birth
          </Label>
          <Input {...register('dob')} id="dob" type="date" className="ps-4" />
          {errors.dob && (
            <span className="text-sm font-medium text-destructive">
              {errors.dob.message}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function NotesForDoctor() {
  const { register } = useFormContext<z.infer<typeof appointmentSchema>>()
  return (
    <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold md:text-xl">
          Notes for Doctor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col items-start gap-2 pt-6 text-foreground">
        <Label className="text-foreground" htmlFor="notes">
          Reasons for Appointment{' '}
          <span className="text-sm text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          {...register('notes')}
          id="notes"
          placeholder="Please describe your symptoms or reasons for the appointment..."
          className="min-h-[120px] resize-none ps-4"
        />
      </CardContent>
    </Card>
  )
}

function AppointmentDetails() {
  const { id } = useParams<{ id: string }>()
  const [doctorDetails] = api.doctors.details.useSuspenseQuery(id)
  const searchParams = useSearchParams()
  const date = new Date(searchParams.get('date') ?? '').toLocaleDateString(
    'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
  const time = searchParams.get('time')

  const appointmentDuration =
    doctorDetails?.operatingHours?.[0]?.consultationDuration
  const timeRange = getTimeRange(time, appointmentDuration)

  return (
    <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold md:text-xl">
          Appointment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col items-start gap-6 pt-6 text-foreground">
        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="consultationFee">
            Consultation Fee
          </Label>
          <Input
            value={formatMoney(doctorDetails?.consultationFee)}
            readOnly
            className="cursor-not-allowed ps-4"
          />
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="date">
            Appointment Date
          </Label>

          <div className="relative w-full">
            <Input value={date} readOnly className="cursor-not-allowed pl-10" />
            <CalendarIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="time">
            Appointment Time
          </Label>
          <div className="relative w-full">
            <Input
              value={`${timeRange?.start} - ${timeRange?.end}`}
              readOnly
              className="cursor-not-allowed pl-10"
            />
            <ClockIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const appointmentSchema = z.object({
  appointmentType: z.enum(['physical', 'online']),
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  phone: z
    .string()
    .refine((val) => /^\d{10}$/.test(val) || /^254\d{9}$/.test(val), {
      message: 'Invalid phone number',
    })
    .refine(
      (val) =>
        val.startsWith('07') ||
        val.startsWith('01') ||
        val.startsWith('2547') ||
        val.startsWith('2541'),
      {
        message: 'Invalid phone number',
      },
    )
    .transform((val) => {
      if (val.startsWith('0')) {
        return `254${val.slice(1)}`
      }
      return val
    }),
  email: z.string().email({ message: 'Invalid email address' }),
  dob: z.string().min(1, { message: 'Date of birth is required' }),
  notes: z.string().optional(),
})

function BookingForm() {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const [doctorDetails] = api.doctors.details.useSuspenseQuery(id)
  const [currentUser] = api.users.currentUser.useSuspenseQuery()
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointmentType: 'online',
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
      phone: '',
      email: currentUser?.email ?? '',
    },
  })
  const { mutateAsync, isPending } = api.users.createAppointment.useMutation()
  const router = useRouter()
  const utils = api.useUtils()

  useEffect(() => {
    if (!currentUser) {
      const callbackUrl = new URLSearchParams(searchParams)
      callbackUrl.set(
        'callbackUrl',
        `/find-specialists/${id}/book?${callbackUrl.toString()}`,
      )
      redirect(`/auth?role=patient&${callbackUrl.toString()}`)
    }
  }, [currentUser, searchParams, id])

  if (currentUser?.role === 'doctor') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-lg border bg-background p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-destructive">
            Register as a Patient to book appointment
          </h2>
          <p className="text-muted-foreground">
            Please log out and register as a patient to book an appointment.
          </p>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: z.infer<typeof appointmentSchema>) => {
    try {
      const selectedDate = searchParams.get('date')
      const selectedTimeRaw = searchParams.get('time')

      if (!selectedDate || !selectedTimeRaw) {
        toast({
          title: 'Error',
          description: 'Please select a date and time for the appointment.',
          variant: 'destructive',
        })
        return
      }

      if (!doctorDetails.id) {
        toast({
          title: 'Error',
          description: 'Doctor details not found.',
          variant: 'destructive',
        })
        return
      }

      const finalData = {
        ...data,
        doctorId: doctorDetails.id,
        date: combineDateTime(selectedDate, selectedTimeRaw),
      }
      await mutateAsync(finalData)
      form.reset()
      if (currentUser) {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Appointment booked!</span>
            </div>
          ),
        })
        router.push('/appointments')
        return
      }
      setIsOpen(true)
      await utils.doctors.list.refetch()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'An error occurred while booking your appointment',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-6"
      >
        <div className="flex flex-col gap-6">
          <FormProvider {...form}>
            <AppointmentType />
            <PatientInformation />
            <NotesForDoctor />
            <AppointmentDetails />
          </FormProvider>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-fit" disabled={isPending}>
            {isPending && <Loader className={`animate-spin`} />}
            Book Appointment
          </Button>
        </div>
      </form>
      <AppointmentConfirmation isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}

export default function CreateAppointment() {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <DoctorCard />
      <BookingForm />
    </div>
  )
}
