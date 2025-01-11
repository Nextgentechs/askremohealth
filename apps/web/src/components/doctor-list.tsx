'use client'

import React, { useState } from 'react'
import { Card } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Stethoscope } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'
import { Button } from './ui/button'
import Link from 'next/link'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from './ui/pagination'
import { api, type RouterOutputs } from '@web/trpc/react'
import { useDoctorSearchParams } from './search-form'
import { getScheduleForWeek } from '@web/lib/utils'
import { Skeleton } from './ui/skeleton'
import DoctorDetails from './doctor-details'
import { useRouter } from 'next/navigation'

type ScheduleDay = {
  date: Date
  label?: string
  slots: {
    time: string
    available: boolean
  }[]
}

export type OperatingHours =
  RouterOutputs['doctors']['list']['doctors'][number]['operatingHours'][number]

function TimeSlotCard({
  days,
  doctorId,
}: {
  days: ScheduleDay[]
  doctorId: string
}) {
  const [showMore, setShowMore] = useState<Record<number, boolean>>({})

  return (
    <div className="grid grid-cols-2 gap-4">
      {days.map((day, dayIndex) => (
        <div key={dayIndex} className="w-24 rounded-lg border bg-white">
          <h3 className="border-b px-4 py-2 text-center text-sm font-medium text-primary">
            {day.label ??
              new Date(day.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
          </h3>
          <div className="flex flex-col gap-y-3 px-4 py-2">
            {day.slots
              .slice(0, showMore[dayIndex] ? undefined : 5)
              .map((slot, index) => (
                <Link
                  href={`/doctors/${doctorId}/book?date=${day.date.toISOString()}&time=${slot.time}`}
                  className={`${slot.available ? 'text-primary hover:underline' : 'cursor-not-allowed text-muted-foreground line-through'} inline-flex h-fit items-center justify-center p-0 text-xs font-medium underline-offset-4 transition-colors`}
                  key={index}
                >
                  {slot.time}
                </Link>
              ))}
            {day.slots.length > 6 && !showMore[dayIndex] ? (
              <Button
                variant={'link'}
                size={'sm'}
                onClick={() =>
                  setShowMore((prev) => ({ ...prev, [dayIndex]: true }))
                }
                className="h-fit pt-0"
              >
                More
              </Button>
            ) : day.slots.length > 6 ? (
              <Button
                variant={'link'}
                size={'sm'}
                onClick={() =>
                  setShowMore((prev) => ({ ...prev, [dayIndex]: false }))
                }
                className="h-fit pt-0"
              >
                Less
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function TimeSlotCarousel({
  operatingHours,
  bookedSlots,
  doctorId,
}: {
  operatingHours: OperatingHours[]
  bookedSlots: Date[]
  doctorId: string
}) {
  const schedule = getScheduleForWeek(operatingHours, bookedSlots)

  const pairedDays = schedule.reduce<ScheduleDay[][]>((acc, day, index) => {
    if (index % 2 === 0) {
      acc.push([day])
    } else {
      acc[acc.length - 1]?.push(day)
    }
    return acc
  }, [])

  return (
    <div className="flex flex-col items-center gap-5 sm:me-10">
      <Carousel className="w-full max-w-56">
        <CarouselContent>
          {pairedDays.map((dayPair, index) => (
            <CarouselItem key={index}>
              <TimeSlotCard days={dayPair} doctorId={doctorId} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="inline-flex justify-center">
        <span className="text-center text-xs text-accent-foreground opacity-80">
          Please select appointment time slot
        </span>
      </div>
    </div>
  )
}

function DoctorCardSkeleton() {
  return (
    <Card className="flex h-64 w-full flex-col justify-between gap-8 rounded-xl border border-none p-0 shadow-sm sm:flex-row lg:flex-row">
      <Skeleton className="h-full w-full rounded-xl" />
    </Card>
  )
}

function EmptyDoctors() {
  return (
    <Card className="flex h-64 w-full flex-col items-center justify-center gap-2 text-center">
      <Stethoscope className="size-12 text-muted-foreground/60" />
      <h3 className="font-medium">No doctors found</h3>
      <p className="text-sm text-muted-foreground">
        Try adjusting your search filters
      </p>
    </Card>
  )
}

function useDoctorList() {
  const [searchParams] = useDoctorSearchParams()
  const page = Number(searchParams.page)

  const transformedExperiences = searchParams.experiences?.map((range) => {
    if (range.includes('+')) {
      return { min: Number(range.replace('+', '')) }
    }
    const [min, max] = range.split('-')
    return {
      min: Number(min),
      max: Number(max),
    }
  })

  return api.doctors.list.useQuery(
    {
      county: searchParams.county ?? undefined,
      town: searchParams.town ?? undefined,
      query: searchParams.query ?? undefined,
      specialty: searchParams.specialty ?? undefined,
      subSpecialties: searchParams.subSpecialties ?? undefined,
      experiences: transformedExperiences,
      genders:
        searchParams.genders?.map((g) => g as 'male' | 'female') ?? undefined,
      entities: searchParams.entities ?? undefined,
      page,
      limit: 10,
    },
    { refetchOnMount: false },
  )
}

export default function DoctorList() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useDoctorSearchParams()
  const { data, isLoading } = useDoctorList()
  const page = Number(searchParams.page)
  const totalPages = Math.ceil((data?.count ?? 0) / 10)

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6">
        {[...Array(10)].map((_, i) => (
          <DoctorCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!data?.doctors.length) {
    return <EmptyDoctors />
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {data?.doctors.map((doctor) => (
        <Card
          key={doctor.id}
          className="flex h-fit w-full flex-col justify-between gap-8 rounded-xl border shadow-sm sm:flex-row lg:flex-row"
        >
          <div
            className="flex flex-1 flex-row gap-5 md:gap-8 xl:gap-10"
            onClick={() => router.push(`/doctors/${doctor.id}`)}
          >
            <Avatar className="hidden cursor-pointer md:block md:size-28">
              <AvatarImage src={doctor.user.profilePicture?.url} />
              <AvatarFallback>
                {doctor.user.firstName.charAt(0)}
                {doctor.user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <DoctorDetails doctor={doctor} />
          </div>
          <TimeSlotCarousel
            operatingHours={doctor.operatingHours}
            bookedSlots={doctor.bookedSlots ?? []}
            doctorId={doctor.id}
          />
        </Card>
      ))}

      <Pagination className="py-5">
        <PaginationContent>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === page}
                onClick={(e) => {
                  e.preventDefault()
                  setSearchParams({ page: p })
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>
    </div>
  )
}
