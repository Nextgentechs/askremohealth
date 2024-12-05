'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from './ui/carousel'
import patientsData from '~/data/whatpatientsay'

function PatientData({
  rating,
  description,
  name,
  occupation,
}: (typeof patientsData)[0][0]) {
  const [mouseOver, setMouseOver] = useState(false)
  return (
    <Card
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      className="border-[1px] border-border p-4"
    >
      <CardHeader>
        <p>{rating}</p>
        <CardTitle className="text-left text-sm md:text-base">
          {description}
        </CardTitle>
      </CardHeader>
      <CardContent />
      <CardFooter className="flex flex-col items-end gap-2">
        <p className="text-base font-semibold">{name}</p>
        <p className="text-sm font-normal">{occupation}</p>
      </CardFooter>
    </Card>
  )
}

function WhatPatientsSayCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])
  return (
    <div className="flex w-full flex-col gap-8">
      <Carousel setApi={setApi}>
        <CarouselContent className="py-2">
          {Array.from({ length: patientsData.length }).map(
            (_, carouselIndex) => (
              <CarouselItem
                key={carouselIndex}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
              >
                {patientsData[carouselIndex]?.map((patientData, index) => (
                  <PatientData key={index} {...patientData} />
                ))}
              </CarouselItem>
            ),
          )}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 flex justify-center">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={`mx-1 h-3 w-3 rounded-full transition-colors duration-300 ${
              current - 1 === index ? 'bg-primary' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

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
      <WhatPatientsSayCarousel />
      {/* <Carousel
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
      </Carousel> */}
    </div>
  )
}
