'use client'

import React, { useState } from 'react'
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

type TimeSlot = {
  time: string
  available: boolean
}

type ScheduleDay = {
  date: Date
  label?: string
  slots: TimeSlot[]
}

function DoctorDetails() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <div className="flex flex-row gap-3">
        <Avatar className="size-24 shrink-0 md:hidden md:size-28">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-start gap-0.5">
            <h2 className="text-sm font-medium text-foreground">
              Dr. Nelson Mathenge
            </h2>
            <p className="break-words text-sm text-muted-foreground">
              MBChB, MMed (Psychiatry). Consultant Psychiatrist.
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <StarRating totalStars={5} initialRating={5} readOnly />
            <span className="text-sm tracking-wide text-muted-foreground">
              (6 Reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <Stethoscope className="size-5 shrink-0" />
          <span className="break-words md:truncate">
            Psychiatrist Specialized in Toxicology, Addiction, Family Conseling
          </span>
        </div>

        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <Hospital className="size-5 shrink-0" />
          <span className="break-words">Utumishi Medical Center</span>
        </div>

        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <MapPin className="size-5 shrink-0" />
          <span className="break-words">Lavington: Muthaiga Road</span>
        </div>

        <div className="flex flex-row items-start gap-2 text-sm font-normal">
          <Banknote className="size-5 shrink-0" />
          <span className="break-words">Consultation Fee: Ksh 3,000</span>
        </div>
      </div>
    </div>
  )
}

const today = new Date()
const schedule = [
  {
    date: today,
    label: 'Today',
    slots: [
      { time: '10:00 AM', available: true },
      { time: '10:45 AM', available: true },
      { time: '11:30 AM', available: true },
      { time: '12:15 PM', available: false },
      { time: '01:00 PM', available: true },
      { time: '01:45 PM', available: true },
      { time: '02:30 PM', available: false },
    ],
  },
  {
    date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    label: 'Tomorrow',
    slots: [
      { time: '10:00 AM', available: true },
      { time: '10:45 AM', available: true },
      { time: '11:30 AM', available: true },
      { time: '12:15 PM', available: true },
      { time: '01:00 PM', available: true },
      { time: '01:45 PM', available: false },
    ],
  },
  ...Array.from({ length: 5 }).map((_, i) => ({
    date: new Date(today.getTime() + (i + 2) * 24 * 60 * 60 * 1000),
    slots: Array.from({ length: 7 }).map((_, j) => ({
      time: `${(10 + Math.floor(j / 2)).toString().padStart(2, '0')}:${j % 2 === 0 ? '00' : '45'} ${j < 4 ? 'AM' : 'PM'}`,
      available: Math.random() > 0.3,
    })),
  })),
]

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

function TimeSlotCarousel() {
  const pairedDays = schedule.reduce<ScheduleDay[][]>((acc, day, index) => {
    if (index % 2 === 0) {
      acc.push([day])
    } else {
      if (!acc[Math.floor(index / 2)]) {
        acc[Math.floor(index / 2)] = []
      }
      acc[Math.floor(index / 2)]?.push(day)
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

export default function DoctorCard() {
  return (
    <Card className="flex h-fit w-full flex-col justify-between gap-8 rounded-xl border shadow-sm sm:flex-row lg:flex-row">
      <div className="flex flex-1 flex-row gap-5 md:gap-8 xl:gap-10">
        <Avatar className="hidden md:block md:size-28">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <DoctorDetails />
      </div>
      <TimeSlotCarousel />
    </Card>
  )
}
