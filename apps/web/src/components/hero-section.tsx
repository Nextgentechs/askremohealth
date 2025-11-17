'use client'

import Image from 'next/image'
import BookAppointmentButton from './BookAppointmentButton'

export default function HeroSection() {
  return (
    <section className="mt-4 flex w-full sm:h-56 items-center text-center sm:flex-row sm:justify-between lg:mt-0 lg:h-[360px] lg:gap-16 lg:px-12 xl:mt-0 xl:h-[432px]">
      <div className="flex flex-grow flex-col items-center justify-center text-center gap-4 lg:items-start lg:text-left">
        <h1 className="text-2xl max-[342px]:text-xl font-extrabold leading-tight text-primary transition-all duration-300 sm:text-3xl md:text-4xl xl:text-5xl">
          <div className="whitespace-nowrap">Solutions that help you and</div>
          <div className="whitespace-nowrap">your loved ones enjoy</div>
          <span className="whitespace-nowrap">
            <span className="text-custom-primary-green decoration-custom-primary-green">
              Good Health
            </span>{' '}
            and{' '}
            <span className="text-custom-primary-green decoration-custom-primary-green">
              Long Life
            </span>
          </span>
        </h1>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          We take the guesswork out of finding the right doctors, hospitals, and
          care for your family.
        </p>
        <div className="relative z-[3] lg:z-[0]">
          <BookAppointmentButton />
        </div>
      </div>

      <Image
        src="/assets/hero.webp" // reference relative to public folder
        alt="Doctor Image"
        priority
        width={488}   // required by next/image
        height={488}  // required by next/image
        className="hidden mt-14 lg:block w-[408px] h-[408px] xl:w-[488px] xl:h-[488px]"
        sizes="(max-width: 1024px) 408px, 488px"
      />
    </section>
  )
}
