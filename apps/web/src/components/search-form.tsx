'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '../lib/utils'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'

import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'

import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Card } from './ui/card'
import { Skeleton } from './ui/skeleton'
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs'
import { api } from '@web/trpc/react'
import { useRouter } from 'next-nprogress-bar'
import { Label } from './ui/label'
import { Input } from './ui/input'

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

const FormSchema = z.object({
  specialty: z.string(),
  query: z.string(),
  county: z.string(),
  town: z.any(),
})

export function SearchForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

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

  const sortedCounties = counties?.map(() =>
    [...counties].sort((a, b) => a.name.localeCompare(b.name))).flat(1)
	
  const sortedTowns = towns?.map(() =>
    [...towns].sort((a, b) => a.name!.localeCompare(b.name!))).flat(1)

  const uniqueKeyCounties = [...new Set(sortedCounties?.map((item) => item))]
  const uniqueKeyTowns = [...new Set(sortedTowns?.map((item) => item))]

  const router = useRouter()

  const handleSearch = (e: React.FormEvent<HTMLButtonElement>) => {
	  e.preventDefault()
	
    const params = new URLSearchParams()
    if (query) params.append('query', query)
    if (county) params.append('county', county)
    if (specialty) params.append('specialty', specialty)
    if (town) params.append('town', town)

    router.push(`/doctors?${params.toString()}`)
  }

  return (
    <Card className="mx-auto flex flex-col gap-8 border shadow-sm transition-all duration-300 xl:flex-row xl:items-end xl:px-6 xl:py-8 2xl:py-10">
      <Form {...form}>
        <form className="space-y-6">
          <div className="grid min-w-80 gap-4 transition-all duration-300 sm:grid-cols-2 lg:grid-cols-4">
            <div className="md:w-[256px] 2xl:w-[256px]">
              <Label htmlFor="specialty">Doctor Specialty</Label>
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? specialties?.find(
                                  (specialty) => specialty.name === field.value,
                                )?.name
                              : 'Select a specialty'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search specialty..." />
                          <CommandList>
                            <CommandEmpty>No specialty found.</CommandEmpty>
                            <CommandGroup>
                              {specialtiesLoading ? (
                                <SelectSkeleton />
                              ) : (
                                specialties?.map((specialty) => (
                                  <CommandItem
                                    value={specialty.name}
                                    key={specialty.id}
                                    onSelect={() => {
                                      form.setValue('specialty', specialty.name)
                                      setSearchParams({
                                        specialty: specialty.id,
                                      })
                                    }}
                                  >
                                    {specialty.name}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        specialty.name === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                  </CommandItem>
                                ))
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:w-[256px] 2xl:w-[256px]">
              <Label htmlFor="county">In this county</Label>
              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? uniqueKeyCounties?.find(
                                  (county) => county.name === field.value,
                                )?.name
                              : 'Select a county'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search county..." />
                          <CommandList>
                            <CommandEmpty>No county found.</CommandEmpty>
                            <CommandGroup>
                              {countiesLoading ? (
                                <SelectSkeleton />
                              ) : (
                                uniqueKeyCounties?.map((county) => (
                                  <CommandItem
                                    value={county.name}
                                    key={county.name}
                                    onSelect={() => {
                                      form.setValue('county', county.name)
                                      setSearchParams({ county: county.code })
                                    }}
                                  >
                                    {county.name}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        county.name === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                  </CommandItem>
                                ))
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:w-[256px] 2xl:w-[256px]">
              <Label htmlFor="town">In this town</Label>
              <FormField
                control={form.control}
                name="town"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? uniqueKeyTowns?.find((town) => town.name === field.value)
                                  ?.name
                              : 'Select town'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search town..." />
                          <CommandList>
                            <CommandEmpty>No town found.</CommandEmpty>
                            <CommandGroup>
                              {townsLoading ? (
                                <SelectSkeleton />
                              ) : (
                                uniqueKeyTowns?.map((town) => (
                                  <CommandItem
                                    value={town.name}
                                    key={town.id}
                                    onSelect={() => {
                                      form.setValue('town', town.name)
                                      setSearchParams({ town: town.name })
                                    }}
                                  >
                                    {town.name}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        town.name === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                  </CommandItem>
                                ))
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:w-[256px] 2xl:w-[256px]">
              <Label htmlFor="specialty">Search by name:</Label>
              <FormField
                control={form.control}
                name="query"
                render={() => (
                  <FormItem className="flex flex-col">
                    <Input
                      type="text"
                      id="search"
                      placeholder="Doctor or hospital name"
                      value={query ?? ''}
                      onChange={(e) => {
                        setSearchParams({ query: e.target.value })
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="sm:ml-auto sm:max-w-[200px] lg:flex lg:justify-end">
            <Button className="w-full" onClick={handleSearch}>
              <Search />
              Search
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
