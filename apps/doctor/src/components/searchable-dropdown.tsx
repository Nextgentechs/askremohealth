import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CommandLoading } from 'cmdk'

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

export default function SearchableDropdown({
  loading,
  options,
  placeholder = 'Select an option',
  emptyMessage = 'No results found.',
  onChange,
  onSelect,
}: SearchableDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')

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
            value={
              value
                ? options.find((option) => option.value === value)?.label
                : ''
            }
            onValueChange={(value) => {
              setValue(value)
              onChange?.(value)
            }}
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
