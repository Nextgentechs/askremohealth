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
import { Check, ChevronsUpDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

function useQueryString() {
  const searchParams = useSearchParams()

  return React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  return (
    <Card className="p-6 mx-auto grid grid-cols-4 gap-3 transition-all duration-300 w-90 h-32 items-center w-full">
      <div className="grid grid-cols-4 gap-3 col-span-4">
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
                {specialties.find(
                  (specialty) => specialty.id === selectedSpecialty,
                )?.name ?? 'Select a specialty'}
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
                {counties.find((county) => county.code === selectedCounty)
                  ?.name ?? 'Select a county'}
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
              >
                {towns?.find((town) => town.id === selectedTown)?.name ??
                  'Select a town'}
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
        </div>

        <div className="w-full">
          <Label htmlFor="specialty">Search by name:</Label>
          <Input
            type="text"
            id="search"
            placeholder="Doctor or hospital name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>
    </Card>
  )
}
