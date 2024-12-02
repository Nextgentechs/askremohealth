'use client'
import Image from 'next/image'
import React from 'react'
import Doctor from 'public/assets/hero.webp'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from './ui/select'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { Card } from './ui/card'

const counties = [
  { name: 'Machakos', code: 'MA' },
  { name: 'Nyeri', code: 'NY' },
  { name: 'Kiambu', code: 'KI' },
  { name: 'Nakuru', code: 'NA' },
]

const specialties = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Surgery',
]

const cities = ['Nairobi', 'Kisumu', 'Narok', 'Eldoret', 'Mombasa', 'Nyeri']

export function SearchForm() {
  return (
    <Card className="mx-auto flex flex-col gap-8 border transition-all duration-300 xl:flex-row xl:items-end xl:px-6 xl:py-8 2xl:py-10">
      <div className="grid min-w-80 gap-4 transition-all duration-300 sm:grid-cols-2 lg:grid-cols-4">
        <div className="md:w-[256px] 2xl:w-[256px]">
          <Label htmlFor="specialty">Doctor Specialty</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="xl:w-[256px]">
          <Label htmlFor="county">In this county</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a county" />
            </SelectTrigger>
            <SelectContent>
              {counties.map((county) => (
                <SelectItem key={county.code} value={county.code}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="xl:w-[256px]">
          <Label htmlFor="city">In this city/town</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a city/town" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="xl:w-[256px]">
          <Label htmlFor="search">Or search by name</Label>
          <Input
            type="text"
            id="search"
            placeholder="Doctor or hospital name"
          />
        </div>
      </div>

      <div className="sm:ml-auto sm:max-w-[200px] lg:flex lg:justify-end">
        <Button className="w-full">
          <Search />
          Search
        </Button>
      </div>
    </Card>
  )
}

export default function HeroSection() {
  return (
    <section className="mt-12 flex h-40 w-full gap-8 px-4 sm:h-56 sm:flex-row sm:justify-between sm:gap-12 lg:gap-16 lg:px-12 xl:mt-0 xl:h-[432px]">
      <div className="flex flex-grow flex-col items-center justify-center text-center sm:items-start sm:text-left">
        <h1 className="text-2xl font-extrabold leading-tight text-primary transition-all duration-300 sm:text-3xl lg:text-3xl xl:text-5xl">
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
        className="hidden xl:block xl:h-[528px] xl:w-[520px] 2xl:h-[528px]"
        priority
      />
    </section>
  )
}
