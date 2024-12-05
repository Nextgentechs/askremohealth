'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import Image from 'next/image'

import specialities from '~/data/specialities'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from './ui/carousel'

function Specialty({ specialty, icon }: (typeof specialities)[0][0]) {
  const [mouseOver, setMouseOver] = useState(false)
  return (
    <Card
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      className="shadow-sm transition-transform duration-200 hover:scale-105 hover:cursor-pointer hover:text-primary"
    >
      <CardContent className="flex flex-col items-center justify-center gap-2 px-6 py-4 pb-0">
        <Image src={icon} alt={specialty} width={40} height={40} />
        <span
          className={`text-center text-sm ${mouseOver ? 'text-secondary-foreground' : ''}`}
        >
          {specialty}
        </span>
      </CardContent>
    </Card>
  )
}

function SpecialistsCarousel() {
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
          {Array.from({ length: specialities.length }).map(
            (_, carouselIndex) => (
              <CarouselItem
                key={carouselIndex}
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6 lg:gap-5"
              >
                {specialities[carouselIndex]?.map((specialty, index) => (
                  <Specialty key={index} {...specialty} />
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

export default function MedicalSpecialist() {
  return (
    <section id="medical-specialists" className="w-full bg-secondary py-16">
      <div className="container mx-auto flex flex-col items-center justify-center gap-10">
        <div className="mx-auto flex w-full flex-col items-center justify-center gap-2">
          <h2 className="section-title">Our Medical Specialities</h2>
          <p className="section-description">
            Explore a variety of medical specialties to find the right expert
            for your needs
          </p>
        </div>
        <SpecialistsCarousel />
      </div>
    </section>
  )
}
