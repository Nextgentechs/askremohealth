'use client'

import { Button } from '@web/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@web/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@web/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select'
import useDebounce from '@web/hooks/use-debounce'
import { AppointmentStatus } from '@web/server/utils'
import { api } from '@web/trpc/react'
import { CommandLoading } from 'cmdk'
import { ChevronsUpDown } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { useQueryString } from '../../upcoming-appointments/_components/appointment-tabs'

type Option = {
  value: string
  label: string
}

type SearchableDropdownProps = {
  options: Option[]
  loading?: boolean
  placeholder?: string
  emptyMessage?: string
  onChange?: (value: string) => void
  onSelect?: (value: Option) => void
}

function DropdownSearch({
  loading,
  options,
  placeholder = 'Select an option',
  emptyMessage = 'No results found.',
  onChange,
  onSelect,
}: SearchableDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [searchValue, setSearchValue] = React.useState('')
  const debouncedSearchValue = useDebounce(searchValue, 500)

  React.useEffect(() => {
    onChange?.(debouncedSearchValue)
  }, [debouncedSearchValue, onChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search..."
          />
          <CommandList>
            {!loading && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            {loading && (
              <CommandLoading className="py-4 text-center">
                Loading...
              </CommandLoading>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : option.value)
                    onSelect?.(option)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const appointmentStatusOptions = Object.values(AppointmentStatus).map(
  (status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: status as AppointmentStatus,
  }),
)

export default function AppointmentFilters() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const router = useRouter()
  const pathname = usePathname()
  const createQueryString = useQueryString()

  const { data: patients, isLoading: isLoadingPatients } =
    api.doctors.searchPatient.useQuery({
      query: searchTerm,
    })

  return (
    <div className="flex w-full flex-row gap-6">
      <DropdownSearch
        loading={isLoadingPatients}
        options={
          patients?.map((patient) => ({
            value: patient.id,
            label: `${patient.firstName} ${patient.lastName}`,
          })) ?? []
        }
        placeholder="Select Patient"
        onChange={(value) => {
          setSearchTerm(value)
        }}
        onSelect={(value) => {
          router.push(
            pathname + '?' + createQueryString('patientId', value.value),
          )
        }}
      />

      <Select
        onValueChange={(value) => {
          if (value === 'all') {
            const params = new URLSearchParams(window.location.search)
            params.delete('status')
            router.push(
              `${pathname}${params.toString() ? `?${params.toString()}` : ''}`,
            )
          } else {
            router.push(pathname + '?' + createQueryString('status', value))
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {appointmentStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
