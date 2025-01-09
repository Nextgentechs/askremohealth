'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useParams, useSearchParams } from 'next/navigation'
import { api } from '@web/trpc/react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import DoctorDetails from './doctor-details'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Input } from './ui/input'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { z } from 'zod'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatMoney, getTimeRange } from '@web/lib/utils'

function useDoctorDetails() {
  const { doctor } = useParams<{ doctor: string }>()
  return api.doctors.details.useSuspenseQuery(doctor)
}

function DoctorCard() {
  const [doctorDetails] = useDoctorDetails()

  if (!doctorDetails) return null
  return (
    <Card
      key={doctorDetails.id}
      className="hidden h-fit w-full max-w-md flex-col justify-between gap-8 rounded-xl border shadow-sm transition-all duration-300 sm:flex-row lg:flex lg:flex-row xl:max-w-lg 2xl:max-w-xl"
    >
      <div className="flex flex-1 flex-row gap-5 md:gap-8 xl:gap-10">
        <Avatar className="hidden md:block md:size-28">
          <AvatarImage src={doctorDetails.user?.profilePicture?.url} />
          <AvatarFallback>
            {doctorDetails.user?.firstName.charAt(0)}
            {doctorDetails.user?.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <DoctorDetails doctor={doctorDetails} />
      </div>
    </Card>
  )
}

function AppointmentType() {
  const { setValue } = useFormContext<z.infer<typeof appointmentSchema>>()
  return (
    <Card className="rounded-xl border shadow-sm">
      <RadioGroup
        defaultValue="physical"
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
      <CardContent className="grid w-full gap-6 pt-6 sm:grid-cols-2">
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
          <Label className="text-foreground" htmlFor="password">
            Account Password
          </Label>
          <Input
            {...register('password')}
            id="password"
            type="password"
            className="ps-4"
          />
          {errors.password && (
            <span className="text-sm font-medium text-destructive">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="confirmPassword">
            Confirm Password
          </Label>
          <Input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            className="ps-4"
          />
          {errors.confirmPassword && (
            <span className="text-sm font-medium text-destructive">
              {errors.confirmPassword.message}
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
      <CardContent className="flex w-full flex-col items-start gap-2 pt-6">
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
  const [doctorDetails] = useDoctorDetails()
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
      <CardContent className="flex w-full flex-col items-start gap-6 pt-6">
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

const appointmentSchema = z
  .object({
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
    dob: z.string().min(10, { message: 'Date of birth is required' }),
    notes: z.string().optional(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

function BookingForm() {
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
  })

  return (
    <form
      onSubmit={form.handleSubmit((data) => console.log(data))}
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
        <Button type="submit" className="w-fit">
          Book Appointment
        </Button>
      </div>
    </form>
  )
}

export default function NewAppointment() {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <DoctorCard />
      <BookingForm />
    </div>
  )
}
