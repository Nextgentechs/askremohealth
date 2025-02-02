import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { CheckIcon, CirclePlus } from 'lucide-react'
import { AppointmentStatus } from '@/routes/_protected/physical-appointments'
import { useEffect, useState } from 'react'

type FacetedFilterProps = {
  title: string
  options: {
    label: string
    value: AppointmentStatus
  }[]
  onFilterChange: (selectedValues: AppointmentStatus[]) => void
}

export function FacetedFilter({
  title,
  options,
  onFilterChange,
}: FacetedFilterProps) {
  const [selectedValues, setSelectedValues] = useState<Set<AppointmentStatus>>(
    new Set(),
  )

  const handleSelect = (value: AppointmentStatus) => {
    setSelectedValues((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(value)) {
        newSet.delete(value)
      } else {
        newSet.add(value)
      }
      return newSet
    })
  }

  const handleReset = () => {
    setSelectedValues(new Set())
  }

  useEffect(() => {
    onFilterChange(Array.from(selectedValues))
  }, [selectedValues, onFilterChange])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <CirclePlus className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  Array.from(selectedValues)
                    .slice(0, 2)
                    .map((value) => (
                      <Badge
                        variant="secondary"
                        key={value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {
                          options.find((option) => option.value === value)
                            ?.label
                        }
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={`border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      }`}
                    >
                      <CheckIcon className={`h-4 w-4`} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              onSelect={handleReset}
              className="justify-center text-center"
            >
              Reset filters
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
