'use client'

import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { Building2, Phone, ChevronsUpDown, Check, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import { api } from '@web/trpc/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@web/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@web/components/ui/command'
import type { User } from '../../../../../../server/db/schema';
import { useCurrentUser } from '@web/hooks/use-current-user';

const labBasicDetailsSchema = z.object({
  location: z.object({
    placeId: z.string().min(1, 'Location is required'),
    name: z.string(),
    address: z.string().optional(),
  }),
  phone: z
    .string()
    .refine((val) => /^\d{10}$/.test(val) || /^254\d{9}$/.test(val), {
      message: 'Invalid phone number',
    })
    .refine(
      (val) =>
        val.startsWith('07') ||
        val.startsWith('01') ||
        val.startsWith('2547') ||
        val.startsWith('2541'),
      {
        message: 'Invalid phone number',
      },
    )
    .transform((val) => {
      if (val.startsWith('0')) {
        return `254${val.slice(1)}`
      }
      return val
    }),
})
type LabBasicDetails = z.infer<typeof labBasicDetailsSchema>

type LocationSuggestion = {
  placeId: string
  name: string
  address?: string
}

export default function BasicDetailsForm() {
  const router = useRouter()
  const { user } = useCurrentUser() as { user: User | null };
  const form = useForm<LabBasicDetails>({
    resolver: zodResolver(labBasicDetailsSchema),
    defaultValues: {
      location: { placeId: '', name: '', address: '' },
      phone: '',
    },
  })
  const [locationQuery, setLocationQuery] = React.useState('')
  const [openLocation, setOpenLocation] = React.useState(false)
  const [selectedLocation, setSelectedLocation] = React.useState<LocationSuggestion | null>(null)
  const [debouncedLocationQuery] = useDebounce(locationQuery, 300)

  const { data: locationSuggestions = [], isPending: isPendingLocations } =
    api.labs.searchLabsByName.useQuery(
      { query: debouncedLocationQuery },
      { enabled: !!debouncedLocationQuery }
    )
  const { mutateAsync: registerLab, isPending: isSubmitting } = api.labs.registerLab.useMutation()

  const onSubmit = form.handleSubmit(async (data) => {
    if (!selectedLocation) {
      form.setError('location', { type: 'manual', message: 'Location is required' })
      return
    }
    if (!user?.id) {
      form.setError('location', { type: 'manual', message: 'User not found' })
      return
    }
    try {
      await registerLab({
        placeId: selectedLocation.placeId,
        user_id: user.id,
        phone: data.phone,
      })
      router.push('/lab/onboarding/test-details')
    } catch (error) {
      form.setError('location', { type: 'manual', message: 'Failed to register lab' })
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              Lab Information
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Enter your lab&apos;s location and phone number.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FormProvider {...form}>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold text-gray-700">
                    Lab Location *
                  </Label>
                  <Popover open={openLocation} onOpenChange={setOpenLocation}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between text-muted-foreground data-[state=true]:text-foreground"
                        data-state={selectedLocation ? 'true' : 'false'}
                        type="button"
                      >
                        {selectedLocation?.name ?? 'Search for a location'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Type location name..."
                          value={locationQuery}
                          onValueChange={setLocationQuery}
                        />
                        <CommandList>
                          {isPendingLocations ? (
                            <div className="p-2 text-center text-gray-500">Loading...</div>
                          ) : (
                            <>
                              <CommandEmpty>No locations found.</CommandEmpty>
                              <CommandGroup>
                                {locationSuggestions.map((location: LocationSuggestion) => (
                                  <CommandItem
                                    value={location.name}
                                    key={location.placeId}
                                    onSelect={(value) => {
                                      const selected = locationSuggestions.find(
                                        (l: LocationSuggestion) => l.name.toLowerCase() === value.toLowerCase(),
                                      )
                                      if (selected) {
                                        setSelectedLocation(selected)
                                        form.setValue('location', selected)
                                        setLocationQuery(selected.name)
                                      }
                                      setOpenLocation(false)
                                    }}
                                  >
                                    {location.name}{location.address ? `, ${location.address}` : ''}
                                    <Check
                                      className="ml-auto h-4 w-4 opacity-0 data-[selected=true]:opacity-100"
                                      data-selected={location.placeId === selectedLocation?.placeId}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.location?.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold text-gray-700">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 0712345678 or 254712345678"
                      {...form.register('phone')}
                      className="pl-10 h-12 text-base border-2 focus:border-primary"
                    />
                  </div>
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.phone?.message}
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="submit" className="px-8 py-3 text-lg" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="h-5 w-5 animate-spin" /> : 'Submit'}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
