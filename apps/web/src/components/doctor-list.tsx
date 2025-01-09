'use client'

import React, { Fragment, useState } from 'react'
import { Card } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { StarRating } from './star-rating'
import { Banknote, Hospital, MapPin, Stethoscope } from 'lucide-react'
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

function DoctorDetails({
  doctor,
}: {
  doctor: RouterOutputs['doctors']['list']['doctors'][number]
}) {
  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <div className="flex flex-row gap-3">
        <Avatar className="size-24 shrink-0 md:hidden md:size-28">
          <AvatarImage src={doctor.user.profilePicture?.url} />
          <AvatarFallback>
            {doctor.user.firstName.charAt(0)}
            {doctor.user.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-start gap-0.5">
            <Link
              href={`/doctors/${doctor.id}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {doctor.title ?? 'Dr'}. {doctor.user.firstName}{' '}
              {doctor.user.lastName}
            </Link>
            <p className="break-words text-muted-foreground">
              {doctor.specialty?.name}
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <StarRating
              totalStars={5}
              initialRating={doctor.reviewStats.averageRating}
              readOnly
            />
            <span className="text-sm tracking-wide text-muted-foreground">
              ({doctor.reviewStats.totalReviews} Reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <Stethoscope className="size-5 shrink-0" />
          <div>
            <span className="">Specialized in</span>{' '}
            {doctor.subSpecialties.map((subspecialty, index) => (
              <Fragment key={subspecialty.id}>
                <Link
                  href={``}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  {subspecialty.name}
                </Link>
                {index < doctor.subSpecialties.length - 1 && ', '}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <Hospital className="size-5 shrink-0" />
          <span className="break-words">{doctor.facility?.name}</span>
        </div>

        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <MapPin className="size-5 shrink-0" />
          <span className="break-words">{doctor.facility?.address}</span>
        </div>

        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <Banknote className="size-5 shrink-0" />
          <span className="break-words">
            Consultation Fee: Ksh. {doctor.consultationFee ?? 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}

function TimeSlotCard({ days }: { days: ScheduleDay[] }) {
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
                  href={'/'}
                  className={`${slot.available ? 'hover:underline' : 'cursor-not-allowed line-through'} inline-flex h-fit items-center justify-center p-0 text-xs font-medium text-primary underline-offset-4 transition-colors`}
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
}: {
  operatingHours: OperatingHours[]
}) {
  const schedule = getScheduleForWeek(operatingHours)

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
              <TimeSlotCard days={dayPair} />
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
      <Skeleton className="h-full w-full" />
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

export default function DoctorList() {
  const [searchParams, setSearchParams] = useDoctorSearchParams()
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

  const { data, isLoading } = api.doctors.list.useQuery({
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
  })
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
          <div className="flex flex-1 flex-row gap-5 md:gap-8 xl:gap-10">
            <Avatar className="hidden md:block md:size-28">
              <AvatarImage src={doctor.user.profilePicture?.url} />
              <AvatarFallback>
                {doctor.user.firstName.charAt(0)}
                {doctor.user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <DoctorDetails doctor={doctor} />
          </div>
          <TimeSlotCarousel operatingHours={doctor.operatingHours} />
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
