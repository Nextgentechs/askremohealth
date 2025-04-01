'use client';

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface CarouselItem {
  id: number
  titleLines: string[]
  description: string
  image: string
  bgColor: string
  textColor: string
  accentColor: string
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    titleLines: [
      "Solutions that help you and",
      "your loved ones enjoy",
      "Good Health and Long Life"
    ],
    description: "We take the guesswork out of finding the right doctors, hospitals, and care for your family.",
    image: "/assets/hero.webp",
    bgColor: "bg-blue-50",
    textColor: "text-[#553DA6]",
    accentColor: "text-blue-600"
  },
  {
    id: 2,
    titleLines: [
      "Personalized healthcare",
      "solutions tailored to",
      "your unique needs"
    ],
    description: "Our advanced matching system connects you with the perfect healthcare providers.",
    image: "/assets/hero2.png",
    bgColor: "bg-purple-50",
    textColor: "text-[#553DA6]",
    accentColor: "text-teal-600"
  },
  {
    id: 3,
    titleLines: [
      "24/7 access to",
      "trusted medical",
      "advice and support"
    ],
    description: "Connect with healthcare professionals anytime, anywhere through our platform.",
    image: "/assets/hero3.webp",
    bgColor: "bg-cyan-50",
    textColor: "text-[#553DA6]",
    accentColor: "text-cyan-600"
  }
]

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const currentItem = carouselItems[currentIndex]

  // Guard clause in case carouselItems is empty (though it shouldn't be)
  if (!currentItem) {
    return null
  }

  return (
    <section className={`mt-4 flex w-full px-8 sm:h-96 sm:flex-row sm:justify-between lg:mt-0 lg:h-[416px] lg:gap-16 lg:px-56 xl:mt-0 xl:h-[496px] transition-all duration-1000 ${currentItem.bgColor}`}>
      <div className="flex flex-grow flex-col items-center justify-center text-center gap-4 lg:items-start lg:text-left">
        <h1 className={`text-2xl font-extrabold leading-tight transition-all duration-300 sm:text-3xl md:text-4xl xl:text-5xl ${currentItem.textColor}`}>
          {currentItem.titleLines.map((line, index) => (
            <div key={index} className="whitespace-nowrap">
              {line.includes("Good Health") || line.includes("Long Life") || line.includes("unique needs") || line.includes("advice and support") ? (
                <span className={`underline decoration-wavy decoration-2 underline-offset-4 ${currentItem.accentColor}`}>
                  {line}
                </span>
              ) : (
                line
              )}
            </div>
          ))}
        </h1>
        <p className={`mt-4 sm:text-lg ${currentItem.textColor}`}>
          {currentItem.description}
        </p>
        
        {/* Carousel indicators */}
        <div className="flex gap-2 mt-6">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${index === currentIndex ? currentItem.accentColor + ' w-6' : 'bg-gray-300'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <Image
        src={currentItem.image}
        alt="Healthcare Image"
        width={488}
        height={488}
        priority
        className="hidden lg:block w-[408px] h-[408px] xl:w-[488px] xl:h-[488px] transition-all duration-1000"
      />
    </section>
  )
}