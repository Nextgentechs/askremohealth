'use client'

import { api, type RouterOutputs } from '@web/trpc/react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Skeleton } from './ui/skeleton'

export function SelectSkeleton() {
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

export default function SearchForm() {
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<{
    id: string
    name: string
  } | null>(null)
  const [selectedCounty, setSelectedCounty] =
    React.useState<RouterOutputs['locations']['counties'][number]>()
  const [selectedTown, setSelectedTown] =
    React.useState<RouterOutputs['locations']['towns'][number]>()
  const [query, setQuery] = React.useState('')
  const router = useRouter()

  const { data: specialties } = api.specialties.listSpecialties.useQuery()
  const { data: counties } = api.locations.counties.useQuery()
  const { data: towns, isLoading: townsLoading } = api.locations.towns.useQuery(
    { countyCode: selectedCounty?.code },
    { enabled: !!selectedCounty },
  )

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedSpecialty) params.set('specialty', selectedSpecialty.id)
    if (selectedCounty) params.set('county', selectedCounty.code)
    if (selectedTown?.id) params.set('town', selectedTown.id)
    if (query) params.set('query', query)
    router.push(`/find-specialists?${params.toString()}`)
  }

  return (
    <Card className="p-6 mx-auto mt-20 sm:mt-8 xl:mt-0 xl:grid xl:grid-cols-5 gap-3 transition-all duration-300 w-90 xl:h-32 items-center 2xl:w-[1184px] xl:w-[1088px] sm:w-[500px] lg:w-[888px] md:w-[600px]">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 xl:col-span-4">
        <div className="w-full">
          <Label>Doctor Specialty</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                data-state={selectedSpecialty ? 'true' : 'false'}
                className="w-full justify-between data-[state=false]:text-muted-foreground"
              >
                {selectedSpecialty?.name ?? 'Select a specialty'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search specialty..." />
                <CommandList>
                  <CommandEmpty>No specialty found.</CommandEmpty>
                  <CommandGroup>
                    {specialties?.map((specialty) => (
                      <CommandItem
                        value={specialty.name}
                        className="cursor-pointer"
                        key={specialty.id}
                        onSelect={() => {
                          if (specialty.id === selectedSpecialty?.id) {
                            setSelectedSpecialty(null)
                          } else {
                            setSelectedSpecialty(specialty)
                          }
                        }}
                      >
                        {specialty.name}
                        <Check
                          data-selected={specialty.id === selectedSpecialty?.id}
                          className="ml-auto data-[selected=true]:opacity-100 data-[selected=false]:opacity-0"
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full">
          <Label htmlFor="county">In this county</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                data-state={selectedCounty ? 'true' : 'false'}
                className="w-full justify-between data-[state=false]:text-muted-foreground"
              >
                {selectedCounty?.name ?? 'Select a county'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search county..." />
                <CommandList>
                  <CommandEmpty>No county found.</CommandEmpty>
                  <CommandGroup>
                    {counties?.map((county) => (
                      <CommandItem
                        value={county.name}
                        key={county.code}
                        onSelect={() => {
                          if (county.code === selectedCounty?.code) {
                            setSelectedCounty(undefined)
                            setSelectedTown(undefined)
                          } else {
                            setSelectedCounty(county)
                            setSelectedTown(undefined)
                          }
                        }}
                      >
                        {county.name}
                        <Check
                          data-selected={county.code === selectedCounty?.code}
                          className="ml-auto data-[selected=true]:opacity-100 data-[selected=false]:opacity-0"
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full">
          <Label htmlFor="town">In this town</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                data-state={selectedTown ? 'true' : 'false'}
                className="w-full justify-between data-[state=false]:text-muted-foreground"
                disabled={!selectedCounty}
              >
                {selectedTown?.name ?? 'Select a town'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search town..." />
                <CommandList>
                  <CommandEmpty>
                    {selectedCounty
                      ? 'No town found.'
                      : 'Please select a county'}
                  </CommandEmpty>
                  <CommandGroup>
                    {townsLoading ? (
                      <SelectSkeleton />
                    ) : (
                      towns?.map((town) => (
                        <CommandItem
                          value={town.name}
                          key={town.id}
                          onSelect={() => {
                            if (town.id === selectedTown?.id) {
                              setSelectedTown(undefined)
                            } else {
                              setSelectedTown(town)
                            }
                          }}
                        >
                          {town.name}
                          <Check
                            data-selected={town.id === selectedTown?.id}
                            className="ml-auto data-[selected=true]:opacity-100 data-[selected=false]:opacity-0"
                          />
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full">
          <Label htmlFor="specialty">Search by name:</Label>
          <Input
            type="text"
            id="search"
            placeholder="Doctor or hospital name"
            value={query ?? ''}
            onChange={(e) => {
              setQuery(e.target.value)
            }}
          />
        </div>
      </div>

      <div className="flex w-full justify-end">
        <Button
          className="w-full lg:w-[216px] mt-6"
          onClick={handleSearch}
        >
          <Search />
          Search
        </Button>
      </div>
    </Card>
  )
}
