import Image from 'next/image'
import React from 'react'
import Doctor from 'public/assets/hero.webp'

export default function HeroSection() {
  return (
    <section className="mt-6 flex h-40 w-full gap-8 px-4 sm:h-56 sm:flex-row sm:justify-between sm:gap-12 lg:mt-0 lg:h-[360px] lg:gap-16 lg:px-12 xl:mt-0 xl:h-[432px]">
      <div className="flex flex-grow flex-col items-center justify-center text-center lg:items-start lg:text-left">
        <h1 className="text-2xl font-extrabold leading-tight text-primary transition-all duration-300 sm:text-3xl lg:text-4xl xl:text-5xl">
          <div className="whitespace-nowrap">Solutions that help you and</div>
          <div className="whitespace-nowrap">your loved ones enjoy</div>
          <span className="whitespace-nowrap">
            <span className="text-custom-primary-green underline decoration-custom-primary-green decoration-wavy decoration-2 underline-offset-4">
              Good Health
            </span>{' '}
            and{' '}
            <span className="text-custom-primary-green underline decoration-custom-primary-green decoration-wavy decoration-2 underline-offset-4">
              Long Life
            </span>
          </span>
        </h1>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          We take the guesswork out of finding the right doctors, hospitals, and
          care for your family.
        </p>
      </div>

      <Image
        src={Doctor}
        alt="Doctor Image"
        className="hidden w-[454px] lg:block lg:h-[434px] xl:h-[528px] xl:w-[520px] 2xl:h-[528px]"
        priority
      />
    </section>
  )
}
