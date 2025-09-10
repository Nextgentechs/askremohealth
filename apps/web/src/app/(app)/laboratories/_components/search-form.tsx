"use client"

import React from "react"
import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@web/components/ui/command"
import { Input } from "@web/components/ui/input"
import { Label } from "@web/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@web/components/ui/popover"
import { api } from "@web/trpc/react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { KENYA_COUNTIES } from "@web/server/data/kenya-counties"
import LabsList from "@web/components/labs-list"

function useQueryString() {
  const searchParams = useSearchParams()
  return React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === "") {
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

export default function LabsSearchForm() {
  const searchParams = useSearchParams()
  const selectedCounty = searchParams.get("county")
  const query = searchParams.get("query")

  const router = useRouter()
  const pathname = usePathname()
  const createQueryString = useQueryString()

  const [searchInput, setSearchInput] = React.useState(query ?? "")
  const debouncedQuery = useDebounceValue(searchInput, 500)

  React.useEffect(() => {
    router.push(pathname + "?" + createQueryString("query", debouncedQuery))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  // County list from KENYA_COUNTIES
  const counties = KENYA_COUNTIES

  // Get county name for API (or undefined for all)
  const countyName = React.useMemo(() => {
    if (!selectedCounty) return undefined
    return counties.find((c) => c.code === selectedCounty)?.name
  }, [selectedCounty, counties])

  // Server-side filtered query
  const { data: labs = [], isLoading } = api.labs.filterLabs.useQuery({
    name: debouncedQuery || undefined,
    county: countyName,
  })

  return (
    <Card className="p-6 mx-auto grid grid-cols-4 gap-3 transition-all duration-300 w-90 items-center w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-4">
        {/* County Filter */}
        <div className="w-full">
          <Label htmlFor="county">In this county</Label>
      <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  data-state={selectedCounty ? "true" : "false"}
                  className="w-full justify-between data-[state=false]:text-muted-foreground pr-8"
                >
                  <span className="truncate">
                    {counties.find((county) => county.code === selectedCounty)?.name ?? "Select a county"}
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
                      {counties.map((county) => (
                        <CommandItem
                          value={county.name}
                          key={county.code}
                          onSelect={() => {
                            if (county.code === selectedCounty) {
                              router.push(pathname + "?" + createQueryString("county", ""))
                            } else {
                              router.push(pathname + "?" + createQueryString("county", county.code))
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
                  router.push(pathname + "?" + createQueryString("county", ""))
                }}
              />
            )}
      </div>
    </div>
        {/* Name Search */}
        <div className="w-full relative">
          <Label htmlFor="search">Search by name:</Label>
          <Input
            type="text"
            id="search"
            placeholder="Laboratory name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-8"
          />
          {searchInput && (
            <X
              className="absolute right-2 top-[2.5rem] h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
              onClick={() => setSearchInput("")}
            />
          )}
    </div>
  </div>
  {/* Results Count */}
      <div className="col-span-4 mt-4 pt-4 border-t">
    <p className="text-sm text-gray-600">
          Showing {labs.length} laboratories
    </p>
  </div>
      {/* Loading State */}
      {isLoading ? (
        <div className="col-span-4 text-center py-12">
          <span className="text-gray-500">Loading laboratories...</span>
        </div>
      ) : labs.length > 0 ? (
        <div className="col-span-4">
          <LabsList labs={labs.map(lab => ({
            ...lab,
            phone: lab.phone ?? undefined,
            website: lab.website ?? undefined,
          }))} />
        </div>
      ) : (
        <div className="col-span-4 text-center py-12">
          <span className="text-gray-500">No laboratories found. Try adjusting your search criteria or filters.</span>
        </div>
      )}
    </Card>
  )
}