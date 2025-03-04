'use client'

import { getScheduleForWeek } from '@web/lib/utils'
import { type RouterOutputs } from '@web/trpc/react'
import { Stethoscope } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import DoctorDetails from './doctor-details'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Card } from './ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from './ui/pagination'

export type OperatingHours =
  RouterOutputs['doctors']['list']['doctors'][number]['operatingHours'][number]

function TimeSlotCarousel({
  operatingHours,
  bookedSlots,
  doctorId,
}: {
  operatingHours: OperatingHours[]
  bookedSlots: Date[]
  doctorId: string
}) {
  const [showMore, setShowMore] = useState<Record<number, boolean>>({})
  const schedule = getScheduleForWeek(operatingHours, bookedSlots)

  const pairedDays = schedule.reduce<(typeof schedule)[]>((acc, day, index) => {
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
              <div className="grid grid-cols-2 gap-4">
                {dayPair.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-24 rounded-lg border bg-white"
                  >
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
                            href={`/find-specialists/${doctorId}/book?date=${day.date.toISOString()}&time=${slot.time}`}
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
                            setShowMore((prev) => ({
                              ...prev,
                              [dayIndex]: true,
                            }))
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
                            setShowMore((prev) => ({
                              ...prev,
                              [dayIndex]: false,
                            }))
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

function EmptyDoctors() {
  return (
    <Card className="flex h-64 w-full flex-col items-center justify-center gap-2 border-none shadow-none text-center">
      <Stethoscope className="size-12 text-muted-foreground/60" />
      <h3 className="font-medium">No doctors found</h3>
      <p className="text-sm text-muted-foreground">
        Try adjusting your search filters
      </p>
    </Card>
  )
}

export default function DoctorList({
  data,
}: {
  data: RouterOutputs['doctors']['list']
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page'))

  if (!data?.doctors.length) {
    return <EmptyDoctors />
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {data?.doctors.map((doctor) => (
        <Card
          key={doctor.id}
          className="flex h-fit w-full flex-col p-6 justify-between gap-8 rounded-xl border shadow-sm sm:flex-row lg:flex-row"
        >
          <div
            className="flex flex-1 flex-row gap-5 md:gap-8 xl:gap-10"
            onClick={() => router.push(`/find-specialists/${doctor.id}`)}
          >
            <Avatar className="hidden cursor-pointer md:block md:size-28">
              <AvatarImage src={doctor.profilePicture?.url} />
              <AvatarFallback>
                {doctor.firstName.charAt(0)}
                {doctor.lastName.charAt(0)}
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
          {Array.from(
            { length: Math.ceil((data?.count ?? 0) / 10) },
            (_, i) => i + 1,
          ).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                href={`/find-specialists?page=${p}`}
                isActive={p === (page || 1)}
                onClick={(e) => {
                  e.preventDefault()
                  const params = new URLSearchParams(searchParams)
                  params.delete('page')
                  params.set('page', p.toString())
                  router.push(`/find-specialists?${params.toString()}`)
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
