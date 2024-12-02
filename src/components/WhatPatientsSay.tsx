'use client'

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'

type Specialty = {
  rating: number
  description: string
  name: string
  occupation: string
}

const specialities: Specialty[] = [
  {
    rating: 5,
    description:
      '"Excellent service! Booking an appointment was so easy, and the doctor was incredibly professional and caring."',
    name: 'Alfred Mulaki',
    occupation: 'Patient',
  },
  {
    rating: 5,
    description:
      '"Excellent service! Booking an appointment was so easy, and the doctor was incredibly professional and caring."',
    name: 'Alfred Mulaki',
    occupation: 'Patient',
  },
  {
    rating: 5,
    description:
      '"Excellent service! Booking an appointment was so easy, and the doctor was incredibly professional and caring."',
    name: 'Alfred Mulaki',
    occupation: 'Patient',
  },
  {
    rating: 5,
    description:
      '"Excellent service! Booking an appointment was so easy, and the doctor was incredibly professional and caring."',
    name: 'Alfred Mulaki',
    occupation: 'Patient',
  },
  {
    rating: 5,
    description:
      '"Excellent service! Booking an appointment was so easy, and the doctor was incredibly professional and caring."',
    name: 'Alfred Mulaki',
    occupation: 'Patient',
  },
  {
    rating: 5,
    description:
      '"Excellent service! Booking an appointment was so easy, and the doctor was incredibly professional and caring."',
    name: 'Alfred Mulaki',
    occupation: 'Patient',
  },
]

export default function WhatPatientsSay() {
  return (
    <div className="flex flex-col gap-10 bg-popover px-6 py-8 sm:px-8 md:px-12 lg:px-16 lg:py-16">
      <div className="flex flex-col gap-3">
        <p className="text-center text-2xl font-semibold text-primary md:text-3xl">
          What Our Patients Say
        </p>
        <p className="text-center text-base font-normal text-muted-foreground md:text-lg">
          Discover what patients say about their experiences and the care they
          received.
        </p>
      </div>
      <Carousel
        opts={{
          align: 'start',
        }}
        className="w-full"
      >
        <CarouselContent>
          {specialities.map((specialty, index) => (
            <CarouselItem key={index} className="p-4 md:basis-1/2 lg:basis-1/3">
              <Card className="border-[1px] border-border p-4">
                <CardHeader>
                  <p>{specialty.rating}</p>
                  <CardTitle className="text-left text-sm md:text-base">
                    {specialty.description}
                  </CardTitle>
                </CardHeader>
                <CardContent />
                <CardFooter className="flex flex-col items-end gap-2">
                  <p className="text-base font-semibold">{specialty.name}</p>
                  <p className="text-sm font-normal">{specialty.occupation}</p>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
