'use client'

import testimonials from '@web/data/testimonials'
import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardFooter } from './ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from './ui/carousel'

function WhatPatientsSayCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }))
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
    <div className="flex flex-col gap-8">
      <Carousel
        plugins={[plugin.current]}
        setApi={setApi}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="py-2">
          {Array.from({ length: testimonials.length }).map(
            (_, carouselIndex) => (
              <CarouselItem
                key={carouselIndex}
                className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
              >
                {testimonials[carouselIndex]?.map((testimonial, index) => (
                  <Card className="border p-6 shadow-sm" key={index}>
                    <CardContent className="flex flex-col items-start px-0">
                      <blockquote className="w-full text-start text-sm leading-normal text-muted-foreground">
                        &quot;{testimonial.quote}&quot;
                      </blockquote>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start px-0 pb-0">
                      <div className="text-sm text-accent-foreground">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </CardFooter>
                  </Card>
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
              current - 1 === index ? 'bg-violet-600' : 'bg-violet-200'
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
    <section
      id="top-specialists"
      className="container mx-auto flex w-full flex-col items-center justify-center gap-10 py-16"
    >
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-2">
        <h2 className="section-title"> What Our Patients Say</h2>
        <p className="section-description text-center">
          Discover what patients say about their experiences and the care they
          received.
        </p>
      </div>

      <WhatPatientsSayCarousel />
    </section>
  )
}
