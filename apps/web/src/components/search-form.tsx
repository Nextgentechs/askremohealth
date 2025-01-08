'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useState } from 'react'
import { Skeleton } from './ui/skeleton'
import { api } from '@web/trpc/react'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search } from 'lucide-react'

function SelectSkeleton() {
  return (
    <div className="p-2">
      <Skeleton className="mb-2 h-4 w-full rounded-sm" />
      <Skeleton className="mb-2 h-4 w-full rounded-sm" />
      <Skeleton className="mb-2 h-4 w-full rounded-sm" />
      <Skeleton className="mb-2 h-4 w-full rounded-sm" />
      <Skeleton className="h-4 w-full rounded-sm" />
    </div>
  )
}

export function SearchForm() {
  const [selectedCounty, setSelectedCounty] = useState<string | undefined>(
    undefined,
  )
  const { data: specialties, isLoading: specialtiesLoading } =
    api.specialties.listSpecialties.useQuery()
  const { data: counties, isLoading: countiesLoading } =
    api.locations.counties.useQuery()
  const { data: towns, isLoading: townsLoading } = api.locations.towns.useQuery(
    { countyCode: selectedCounty },
    { enabled: !!selectedCounty },
  )

  return (
    <Card className="mx-auto flex flex-col gap-8 border shadow-sm transition-all duration-300 xl:flex-row xl:items-end xl:px-6 xl:py-8 2xl:py-10">
      <div className="grid min-w-80 gap-4 transition-all duration-300 sm:grid-cols-2 lg:grid-cols-4">
        <div className="md:w-[256px] 2xl:w-[256px]">
          <Label htmlFor="specialty">Doctor Specialty</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialtiesLoading ? (
                <SelectSkeleton />
              ) : (
                specialties?.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="xl:w-[256px]">
          <Label htmlFor="county">In this county</Label>
          <Select
            onValueChange={(value) => setSelectedCounty(value)}
            value={selectedCounty}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a county" />
            </SelectTrigger>
            <SelectContent>
              {countiesLoading ? (
                <SelectSkeleton />
              ) : (
                counties?.map((county) => (
                  <SelectItem key={county.code} value={county.code}>
                    {county.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="xl:w-[256px]">
          <Label htmlFor="city">In this city/town</Label>
          <Select disabled={!selectedCounty}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  selectedCounty ? 'Select a city/town' : 'No county selected'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {townsLoading ? (
                <SelectSkeleton />
              ) : (
                towns?.map((town) => (
                  <SelectItem key={town.id} value={town.id ?? ''}>
                    {town.name}
                  </SelectItem>
                ))
              )}
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
