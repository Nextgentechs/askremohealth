'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useParams } from 'next/navigation'
import { api } from '@web/trpc/react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import DoctorDetails from './doctor-details'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Input } from './ui/input'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'

function DoctorCard() {
  const { doctor } = useParams<{ doctor: string }>()
  const [doctorDetails] = api.doctors.details.useSuspenseQuery(doctor)

  if (!doctorDetails) return null
  return (
    <Card
      key={doctorDetails.id}
      className="flex h-fit w-full max-w-lg flex-col justify-between gap-8 rounded-xl border shadow-sm sm:flex-row lg:flex-row"
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
  return (
    <Card className="rounded-xl border shadow-sm">
      <RadioGroup
        defaultValue="in-person"
        className="flex flex-row justify-between"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="in-person" id="in-person" />
          <Label htmlFor="in-person" className="cursor-pointer">
            Physical Appointment
          </Label>
        </div>

        <div className="flex flex-row items-center space-x-2">
          <RadioGroupItem value="virtual" id="virtual" />
          <Label htmlFor="virtual" className="cursor-pointer">
            Online Appointment
          </Label>
        </div>
      </RadioGroup>
    </Card>
  )
}

function PatientInformation() {
  return (
    <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold">
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid w-full grid-cols-2 gap-6 pt-6">
        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="firstName">
            First Name
          </Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            className="ps-4"
          />
        </div>
        <div className="flex w-full flex-1 flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="lastName">
            Last Name
          </Label>
          <Input id="lastName" placeholder="Enter last name" className="ps-4" />
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="phoneNumber">
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter phone number"
            className="ps-4"
          />
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="email">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            className="ps-4"
          />
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="dob">
            Date of Birth
          </Label>
          <Input id="dob" type="date" className="ps-4" />
        </div>
      </CardContent>
    </Card>
  )
}

function NotesForDoctor() {
  return (
    <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold">
          Notes for Doctor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col items-start gap-2 pt-6">
        <Label className="text-foreground" htmlFor="notes">
          Reasons for Appointment{' '}
          <span className="text-sm text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Please describe your symptoms or reasons for the appointment..."
          className="min-h-[120px] resize-none ps-4"
        />
      </CardContent>
    </Card>
  )
}

function AppointmentDetails() {
  return (
    <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold">
          Appointment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col items-start gap-6 pt-6">
        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="consultationFee">
            Consultation Fee
          </Label>
          <Input
            value="Ksh. 2,000"
            readOnly
            className="cursor-not-allowed ps-4"
          />
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="date">
            Appointment Date
          </Label>

          <div className="relative w-full">
            <Input
              value="Tuesday, 10th January 2025"
              readOnly
              className="cursor-not-allowed pl-10"
            />
            <CalendarIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="time">
            Appointment Time
          </Label>
          <div className="relative w-full">
            <Input
              value="10:00 AM - 11:00 AM"
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

function BookingForm() {
  return (
    <form className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-6">
        <AppointmentType />
        <PatientInformation />
        <NotesForDoctor />
        <AppointmentDetails />
      </div>
      <div className="flex justify-end">
        <Button className="w-fit">Book Appointment</Button>
      </div>
    </form>
  )
}

export default function NewAppointment() {
  return (
    <div className="flex flex-row gap-8">
      <DoctorCard />
      <BookingForm />
    </div>
  )
}
