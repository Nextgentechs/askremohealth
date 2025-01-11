'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Skeleton } from './ui/skeleton'
import { api } from '@web/trpc/react'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  parseAsArrayOf,
  parseAsString,
  parseAsInteger,
  useQueryStates,
} from 'nuqs'

export function useDoctorSearchParams() {
  return useQueryStates({
    specialty: parseAsString,
    county: parseAsString,
    town: parseAsString,
    query: parseAsString,
    subSpecialties: parseAsArrayOf(parseAsString),
    experiences: parseAsArrayOf(parseAsString),
    genders: parseAsArrayOf(parseAsString),
    entities: parseAsArrayOf(parseAsString),
    page: parseAsInteger.withDefault(1),
  })
}

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
  const [{ query, county, specialty, town }, setSearchParams] =
    useDoctorSearchParams()

  const { data: specialties, isLoading: specialtiesLoading } =
    api.specialties.listSpecialties.useQuery()
  const { data: counties, isLoading: countiesLoading } =
    api.locations.counties.useQuery()
  const { data: towns, isLoading: townsLoading } = api.locations.towns.useQuery(
    { countyCode: county ?? undefined },
    { enabled: !!county },
  )

  const router = useRouter()
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.append('query', query)
    if (county) params.append('county', county)
    if (specialty) params.append('specialty', specialty)
    if (town) params.append('town', town)

    router.push(`/doctors?${params.toString()}`)
  }

  return (
    <Card className="mx-auto flex flex-col gap-8 border shadow-sm transition-all duration-300 xl:flex-row xl:items-end xl:px-6 xl:py-8 2xl:py-10">
      <div className="grid min-w-80 gap-4 transition-all duration-300 sm:grid-cols-2 lg:grid-cols-4">
        <div className="md:w-[256px] 2xl:w-[256px]">
          <Label htmlFor="specialty">Doctor Specialty</Label>
          <Select
            onValueChange={(value) => setSearchParams({ specialty: value })}
            value={specialty ?? undefined}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a specialty"></SelectValue>
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
            onValueChange={(value) => setSearchParams({ county: value })}
            value={county ?? undefined}
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
          <Select
            value={town ?? undefined}
            onValueChange={(value) => setSearchParams({ town: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  county ? 'Select a city/town' : 'No county selected'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {townsLoading ? (
                <SelectSkeleton />
              ) : (
                towns?.map((town) => (
                  <SelectItem key={town.id} value={town.name ?? ''}>
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
            value={query ?? ''}
            onChange={(e) => setSearchParams({ query: e.target.value })}
          />
        </div>
      </div>

      <div className="sm:ml-auto sm:max-w-[200px] lg:flex lg:justify-end">
        <Button className="w-full" onClick={handleSearch}>
          <Search />
          Search
        </Button>
      </div>
    </Card>
  )
}
