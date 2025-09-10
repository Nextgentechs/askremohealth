'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
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
import { useCurrentUser } from '@web/hooks/use-current-user'
import { api } from '@web/trpc/react'
import {
  Building2,
  Check,
  ChevronsUpDown,
  Loader,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { z } from 'zod'
import type { User } from '../../../../../../server/db/schema'

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
  const { user } = useCurrentUser() as { user: User | null }
  const form = useForm<LabBasicDetails>({
    resolver: zodResolver(labBasicDetailsSchema),
    defaultValues: {
      location: { placeId: '', name: '', address: '' },
      phone: '',
    },
  })
  const [locationQuery, setLocationQuery] = React.useState('')
  const [openLocation, setOpenLocation] = React.useState(false)
  const [selectedLocation, setSelectedLocation] =
    React.useState<LocationSuggestion | null>(null)
  const [debouncedLocationQuery] = useDebounce(locationQuery, 300)

  const { data: locationSuggestions = [], isPending: isPendingLocations } =
    api.labs.searchLabsByName.useQuery(
      { query: debouncedLocationQuery },
      { enabled: !!debouncedLocationQuery },
    )
  const { mutateAsync: registerLab, isPending: isSubmitting } =
    api.labs.registerLab.useMutation()

  const onSubmit = form.handleSubmit(async (data) => {
    if (!selectedLocation) {
      form.setError('location', {
        type: 'manual',
        message: 'Location is required',
      })
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
      form.setError('location', {
        type: 'manual',
        message: 'Failed to register lab',
      })
    }
  })

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          <Card className="backdrop-blur-xl bg-white/70 border-0 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            {/* Header section with gradient overlay */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#402E7D] opacity-90"></div>
              <CardHeader className="relative text-center pb-8 pt-12 text-white">
                <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Building2 className="w-10 h-10 text-white drop-shadow-sm" />
                </div>
                <CardTitle className="text-3xl font-bold mb-2 tracking-tight">
                  Lab Information
                </CardTitle>
                <CardDescription className="text-blue-100 text-lg font-medium">
                  Set up your laboratory profile
                </CardDescription>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span className="text-blue-200 text-sm">
                    Quick & Easy Setup
                  </span>
                </div>
              </CardHeader>
            </div>

            <CardContent className="p-8 space-y-8">
              <FormProvider {...form}>
                <form onSubmit={onSubmit} className="space-y-8">
                  {/* Location Field */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="location"
                      className="text-base font-semibold text-gray-800 flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Lab Location *
                    </Label>
                    <Popover open={openLocation} onOpenChange={setOpenLocation}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-14 text-left bg-white/80 border-2 border-gray-200 hover:border-blue-400 hover:bg-white transition-all duration-300 rounded-xl shadow-sm"
                          data-state={selectedLocation ? 'true' : 'false'}
                          type="button"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span
                              className={
                                selectedLocation
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-500'
                              }
                            >
                              {selectedLocation?.name ??
                                'Search for your lab location'}
                            </span>
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 border-0 shadow-xl rounded-xl bg-white/95 backdrop-blur-sm">
                        <Command>
                          <CommandInput
                            placeholder="Type location name..."
                            value={locationQuery}
                            onValueChange={setLocationQuery}
                            className="border-0 focus:ring-0"
                          />
                          <CommandList className="max-h-64">
                            {isPendingLocations ? (
                              <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                                <Loader className="h-4 w-4 animate-spin" />
                                <span>Searching...</span>
                              </div>
                            ) : (
                              <>
                                <CommandEmpty className="p-4 text-center text-gray-500">
                                  No locations found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {locationSuggestions.map(
                                    (location: LocationSuggestion) => (
                                      <CommandItem
                                        value={location.name}
                                        key={location.placeId}
                                        onSelect={(value) => {
                                          const selected =
                                            locationSuggestions.find(
                                              (l: LocationSuggestion) =>
                                                l.name.toLowerCase() ===
                                                value.toLowerCase(),
                                            )
                                          if (selected) {
                                            setSelectedLocation(selected)
                                            form.setValue('location', selected)
                                            setLocationQuery(selected.name)
                                          }
                                          setOpenLocation(false)
                                        }}
                                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors"
                                      >
                                        <div className="flex items-center gap-3 w-full">
                                          <MapPin className="w-4 h-4 text-blue-500" />
                                          <div>
                                            <div className="font-medium">
                                              {location.name}
                                            </div>
                                            {location.address && (
                                              <div className="text-sm text-gray-500">
                                                {location.address}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <Check
                                          className="ml-auto h-4 w-4 opacity-0 data-[selected=true]:opacity-100 text-blue-600"
                                          data-selected={
                                            location.placeId ===
                                            selectedLocation?.placeId
                                          }
                                        />
                                      </CommandItem>
                                    ),
                                  )}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.location?.message && (
                      <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        {form.formState.errors.location?.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="phone"
                      className="text-base font-semibold text-gray-800 flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-blue-600" />
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g. 0712345678 or 254712345678"
                        {...form.register('phone')}
                        className="pl-16 h-14 text-base border-2 border-gray-200 focus:border-blue-400 hover:border-blue-300 bg-white/80 rounded-xl shadow-sm transition-all duration-300"
                      />
                    </div>
                    {form.formState.errors.phone?.message && (
                      <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        {form.formState.errors.phone?.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full h-14 text-lg font-semibold bg-primary hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Setting up your lab...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5" />
                          <span>Continue Setup</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>

          {/* Footer text */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Step 1 of 3 • This information helps us set up your lab profile
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
