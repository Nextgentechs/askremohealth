import React from 'react'
import {
  Banknote,
  CalendarClock,
  Hospital,
  MapPin,
  MoreHorizontal,
} from 'lucide-react'
import { api } from '@web/trpc/server'
import { Card } from '@web/components/ui/card'
import { Button } from '@web/components/ui/button'
import { Badge } from '@web/components/ui/badge'
import {
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@web/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu'
import { type RouterOutputs } from '@web/server/api'
import { format } from 'date-fns'
import { formatMoney } from '@web/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@web/components/ui/avatar'
import AppointmentsPagination from '@web/components/appointments-pagination'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>
}) {
  const { page } = await searchParams
  console.log('page', page)

  const appointments = await api.appointments.patients.list({
    page: page ? parseInt(page) : 1,
    limit: 6,
  })

  return (
    <main className="container mx-auto mb-40 mt-12 flex min-h-screen w-full flex-col gap-12 xl:mb-2">
      <Breadcrumb className="lg:ps-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Appointments</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        {appointments.appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>

      <AppointmentsPagination meta={appointments.meta} />
    </main>
  )
}

function AppointmentCard({
  appointment,
}: {
  appointment: RouterOutputs['appointments']['patients']['list']['appointments'][number]
}) {
  return (
    <Card className="rounded-xl border shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <Avatar className="size-16">
              <AvatarImage src={appointment.doctor.user.profilePicture.url} />
              <AvatarFallback>
                {appointment.doctor.user.firstName.charAt(0)}
                {appointment.doctor.user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <h3 className="font-medium text-primary">
                {appointment.doctor.title}. {appointment.doctor.user.firstName}{' '}
                {appointment.doctor.user.lastName}
              </h3>
              <span className="text-sm text-muted-foreground">
                {appointment.doctor.specialty?.name}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Cancel Appointment</DropdownMenuItem>
              <DropdownMenuItem>Reschedule Appointment</DropdownMenuItem>
              <DropdownMenuItem>View Doctor Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex flex-row items-start gap-1">
            <Hospital className="mt-1 size-4" />
            <p className="text-sm">
              {appointment.doctor.facility?.name ?? 'N/A'}
            </p>
          </div>

          <div className="flex flex-row items-start gap-1">
            <MapPin className="mt-1 size-4" />
            <p className="text-sm">
              {appointment.doctor.facility?.address ?? 'N/A'}
            </p>
          </div>

          <div className="flex flex-row items-center gap-1">
            <Banknote className="size-4" />
            <p className="text-sm">
              Fee: {formatMoney(appointment.doctor.consultationFee ?? 0)}
            </p>
          </div>

          <div className="flex flex-row items-center gap-1">
            <CalendarClock className="size-4" />
            <p className="text-sm">
              {format(appointment.appointmentDate, 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>

        <div className="flex flex-row justify-between">
          <Badge variant="outline">
            {appointment.type === 'physical'
              ? 'Physical Appointment'
              : 'Online Appointment'}
          </Badge>
          <Badge variant={appointment.status}>{appointment.status}</Badge>
        </div>
      </div>
    </Card>
  )
}
