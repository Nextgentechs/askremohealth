'use client'

import { SelectSkeleton } from '@web/components/search-form'
import { Button } from '@web/components/ui/button'
import { Card } from '@web/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@web/components/ui/command'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@web/components/ui/popover'
import { api } from '@web/trpc/react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

function useQueryString() {
  const searchParams = useSearchParams()

  return React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === '') {
        params.delete(name)
      } else {
        params.set(name, value)
      }
      return params.toString()
    },
    [searchParams],
  )
}

function useDebounceValue<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  React.useMemo(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
  }, [value, delay])

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return debouncedValue
}

export default function SearchForm() {
  const searchParams = useSearchParams()
  const selectedSpecialty = searchParams.get('specialty')
  const selectedCounty = searchParams.get('county')
  const selectedTown = searchParams.get('town')
  const query = searchParams.get('query')

  const router = useRouter()
  const pathname = usePathname()
  const createQueryString = useQueryString()

  const [specialties] = api.specialties.listSpecialties.useSuspenseQuery()
  const [counties] = api.locations.counties.useSuspenseQuery()
  const { data: towns, isLoading: townsLoading } = api.locations.towns.useQuery(
    { countyCode: selectedCounty ?? undefined },
    { enabled: !!selectedCounty },
  )

  const [searchInput, setSearchInput] = React.useState(query ?? '')
  const debouncedQuery = useDebounceValue(searchInput, 500)

  React.useEffect(() => {
    router.push(pathname + '?' + createQueryString('query', debouncedQuery))
  }, [debouncedQuery, pathname, createQueryString, router])

  return (
    <Card className="p-6 mx-auto grid grid-cols-4 gap-3 transition-all duration-300 w-90 items-center w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 col-span-4">
        <div className="w-full">
          <Label>Doctor Specialty</Label>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  data-state={selectedSpecialty ? 'true' : 'false'}
                  className="w-full justify-between data-[state=false]:text-muted-foreground pr-8"
                >
                  <span className="truncate">
                    {specialties.find(
                      (specialty) => specialty.id === selectedSpecialty,
                    )?.name ?? 'Select a specialty'}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
                            if (specialty.id === selectedSpecialty) {
                              router.push(
                                pathname +
                                  '?' +
                                  createQueryString('specialty', ''),
                              )
                            } else {
                              router.push(
                                pathname +
                                  '?' +
                                  createQueryString('specialty', specialty.id),
                              )
                            }
                          }}
                        >
                          {specialty.name}
                          <Check
                            data-selected={specialty.id === selectedSpecialty}
                            className="ml-auto data-[selected=true]:opacity-100 data-[selected=false]:opacity-0"
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedSpecialty && (
              <X
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
                onClick={() => {
                  router.push(
                    pathname + '?' + createQueryString('specialty', ''),
                  )
                }}
              />
            )}
          </div>
        </div>
        <div className="w-full">
          <Label htmlFor="county">In this county</Label>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  data-state={selectedCounty ? 'true' : 'false'}
                  className="w-full justify-between data-[state=false]:text-muted-foreground pr-8"
                >
                  <span className="truncate">
                    {counties.find((county) => county.code === selectedCounty)
                      ?.name ?? 'Select a county'}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
                          key={county.name}
                          onSelect={() => {
                            if (county.code === selectedCounty) {
                              router.push(
                                pathname + '?' + createQueryString('county', ''),
                              )
                            } else {
                              router.push(
                                pathname +
                                  '?' +
                                  createQueryString('county', county.code),
                              )
                            }
                          }}
                        >
                          {county.name}
                          <Check
                            data-selected={county.code === selectedCounty}
                            className="ml-auto data-[selected=true]:opacity-100 data-[selected=false]:opacity-0"
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedCounty && (
              <X
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
                onClick={() => {
                  router.push(
                    pathname + '?' + createQueryString('county', ''),
                  )
                }}
              />
            )}
          </div>
        </div>
        <div className="w-full">
          <Label htmlFor="town">In this town</Label>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  data-state={selectedTown ? 'true' : 'false'}
                  className="w-full justify-between data-[state=false]:text-muted-foreground pr-8"
                >
                  <span className="truncate">
                    {towns?.find((town) => town.id === selectedTown)?.name ??
                      'Select a town'}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
                              if (town.id === selectedTown) {
                                router.push(
                                  pathname + '?' + createQueryString('town', ''),
                                )
                              } else {
                                router.push(
                                  pathname +
                                    '?' +
                                    createQueryString('town', town?.id ?? ''),
                                )
                              }
                            }}
                          >
                            {town.name}
                            <Check
                              data-selected={town.id === selectedTown}
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
            {selectedTown && (
              <X
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
                onClick={() => {
                  router.push(pathname + '?' + createQueryString('town', ''))
                }}
              />
            )}
          </div>
        </div>
        <div className="w-full relative">
          <Label htmlFor="search">Search by name:</Label>
          <Input
            type="text"
            id="search"
            placeholder="Doctor or hospital name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-8"
          />
          {searchInput && (
            <X
              className="absolute right-2 top-[2.5rem] h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
              onClick={() => setSearchInput('')}
            />
          )}
        </div>
      </div>
    </Card>
  )
}