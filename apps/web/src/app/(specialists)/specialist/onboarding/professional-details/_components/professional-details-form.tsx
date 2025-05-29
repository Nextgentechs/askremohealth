'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@web/components/ui/button';
import { Checkbox } from '@web/components/ui/checkbox';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@web/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@web/components/ui/command';
import { Skeleton } from '@web/components/ui/skeleton';
import { toast } from '@web/hooks/use-toast';
import { fileToBase64 } from '@web/lib/utils';
import { api } from '@web/trpc/react';
import { Check, ChevronDown, ChevronsUpDown, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { useDebounce } from 'use-debounce';

export const professionalDetailsSchema = z.object({
  county: z.string().min(1, { message: 'County is required' }), // countyCode
  town: z
    .object({
      id: z.string().min(1, { message: 'Town is required' }),
      latitude: z.number(),
      longitude: z.number(),
    })
    .refine((data) => data.latitude !== 0 && data.longitude !== 0, {
      message: 'Town is required',
    }),
  specialty: z.string().min(1, { message: 'Specialty is required' }),
  subSpecialty: z
    .array(z.string())
    .min(1, { message: 'Sub Specialty is required' }),
  experience: z
    .string()
    .refine((value) => parseInt(value) > 0, {
      message: 'Experience must be greater than 0',
    })
    .transform((value) => parseInt(value)),
  registrationNumber: z
    .string()
    .min(1, { message: 'Registration number is required' }),
  medicalLicense: z
    .string()
    .optional()
    .refine(
      (base64) => {
        if (!base64) return true;
        const sizeInBytes = (base64.length * 3) / 4;
        return sizeInBytes <= 5 * 1024 * 1024;
      },
      {
        message: 'Medical license must be less than 5MB',
      },
    ),
  facility: z.string().min(1, { message: 'Facility is required' }), // place_id
});
export type ProfessionalDetails = z.infer<typeof professionalDetailsSchema>;

function SelectSkeleton() {
  return (
    <div className="p-2">
      <Skeleton className="mb-2 h-4 w-full rounded-sm" />
      <Skeleton className="mb-2 h-4 w-full rounded-sm" />
      <Skeleton className="mb-2 h-4 w-full rounded-sm" />
      <Skeleton className="mb-2 h-4 w-full rounded-sm" />
      <Skeleton className="h-4 w-full rounded-sm" />
    </div>
  );
}

function SubSpecialtySelect({ specialty }: { specialty: string }) {
  const [open, setOpen] = React.useState(false);
  const { setValue, watch } = useFormContext<ProfessionalDetails>();
  const selectedSubSpecialties = watch('subSpecialty');

  const { data: subspecialties, isPending } =
    api.specialties.listSubSpecialties.useQuery(
      {
        specialityId: specialty,
      },
      {
        enabled: !!specialty,
      },
    );

  const selected = React.useMemo(() => {
    if (!subspecialties) return '';
    const names = subspecialties
      .filter((sub) => selectedSubSpecialties.includes(sub.id))
      .map((sub) => sub.name);
    if (names.length === 0) return '';
    const joined = names.join(', ');
    return joined.length > 30 ? joined.slice(0, 30) + '...' : joined;
  }, [subspecialties, selectedSubSpecialties]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between disabled:cursor-not-allowed"
          disabled={!specialty}
        >
          <span className="truncate">{selected || 'Select'}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="flex flex-col">
          {isPending ? (
            <SelectSkeleton />
          ) : (
            subspecialties?.map((option) => (
              <div
                className="mb-1 flex w-full cursor-pointer flex-row gap-4 text-sm"
                key={option.id}
              >
                <Checkbox
                  checked={selectedSubSpecialties.includes(option.id)}
                  onCheckedChange={(checked) => {
                    setValue(
                      'subSpecialty',
                      checked
                        ? [...selectedSubSpecialties, option.id]
                        : selectedSubSpecialties.filter(
                            (id) => id !== option.id,
                          ),
                    );
                  }}
                />
                <span>{option.name}</span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function ProfessionalDetailsForm() {
  const [selectedSpecialty, setSelectedSpecialty] = React.useState('');
  const [facilityQuery, setFacilityQuery] = React.useState('');
  const [selectedFacility, setSelectedFacility] = React.useState<{
    placeId: string;
    name: string;
    address: string | undefined;
  } | undefined>();
  const [openFacility, setOpenFacility] = React.useState(false);
  const router = useRouter();
  const form = useForm<ProfessionalDetails>({
    resolver: zodResolver(professionalDetailsSchema),
    defaultValues: {
      county: '',
      town: {
        id: '',
        latitude: 0,
        longitude: 0,
      },
      specialty: '',
      subSpecialty: [],
      experience: 0,
      registrationNumber: '',
      medicalLicense: '',
      facility: '',
    },
  });

  const [debouncedFacilityQuery] = useDebounce(facilityQuery, 300);
  const selectedCounty = form.watch('county');
  const selectedTown = form.watch('town');

  const { data: specialties, isPending: isPendingSpecialties } =
    api.specialties.listSpecialties.useQuery();
  const { data: counties } = api.locations.counties.useQuery();
  const { data: towns } = api.locations.towns.useQuery(
    {
      countyCode: selectedCounty,
    },
    {
      enabled: !!selectedCounty,
    },
  );
  const { data: facilitySuggestions, isPending: isPendingFacilities } =
    api.facilities.searchFacilitiesByName.useQuery(
      { query: debouncedFacilityQuery },
      { enabled: !!debouncedFacilityQuery },
    );
  const { mutateAsync: updateProfessionalDetails } =
    api.doctors.updateProfessionalDetails.useMutation();
  const { mutateAsync: registerFacility } =
    api.facilities.registerFacility.useMutation();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (selectedFacility) {
        await registerFacility({ placeId: selectedFacility.placeId });
        data.facility = selectedFacility.placeId;
      }
      const res = await updateProfessionalDetails(data);
      if (res.success) {
        router.push('/specialist/onboarding/availability-details');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'An error occurred',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  });

  React.useEffect(() => {
    console.log('Selected County:', selectedCounty);
    console.log('Selected Town:', selectedTown);
    console.log('Facility Query:', debouncedFacilityQuery);
    console.log('Facility Suggestions:', facilitySuggestions);
    console.log('Selected Facility:', selectedFacility);
  }, [selectedCounty, selectedTown, debouncedFacilityQuery, facilitySuggestions, selectedFacility]);

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Select
            onValueChange={(value) => {
              setSelectedSpecialty(value);
              form.setValue('specialty', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {isPendingSpecialties ? (
                <SelectSkeleton />
              ) : (
                specialties?.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.specialty?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="subSpecialty">Sub Specialty</Label>
          <FormProvider {...form}>
            <SubSpecialtySelect specialty={selectedSpecialty} />
          </FormProvider>
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.subSpecialty?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="county">County</Label>
          <Select
            onValueChange={(value) => {
              form.setValue('county', value);
            }}
            value={selectedCounty}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a county" />
            </SelectTrigger>
            <SelectContent>
              {counties?.map((county) => (
                <SelectItem key={county.name} value={county.code}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.county?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City/Town</Label>
          <Select
            onValueChange={(value) => {
              const town = towns?.find((t) => t.id === value);
              if (town) {
                form.setValue('town', {
                  id: town.id ?? '',
                  latitude: town.location?.lat ?? 0,
                  longitude: town.location?.lng ?? 0,
                });
              }
            }}
          >
            <SelectTrigger disabled={!selectedCounty} className="w-full">
              <SelectValue placeholder="Select a city/town" />
            </SelectTrigger>
            <SelectContent>
              {towns?.map((town) => (
                <SelectItem key={town.id} value={town.id ?? ''}>
                  {town.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.town?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="facility">Facility</Label>
          <Popover open={openFacility} onOpenChange={setOpenFacility}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between text-muted-foreground data-[state=true]:text-foreground"
                data-state={selectedFacility ? 'true' : 'false'}
              >
                {selectedFacility?.name ?? 'Search for a facility'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Type facility name..."
                  value={facilityQuery}
                  onValueChange={setFacilityQuery}
                />
                <CommandList>
                  {isPendingFacilities ? (
                    <SelectSkeleton />
                  ) : (
                    <>
                      <CommandEmpty>No facilities found.</CommandEmpty>
                      <CommandGroup>
                        {facilitySuggestions?.map((facility) => (
                          <CommandItem
                            value={facility.name}
                            key={facility.placeId}
                            onSelect={(value) => {
                              console.log('Facility selected:', value);
                              const selected = facilitySuggestions.find(
                                (f) => f.name.toLowerCase() === value.toLowerCase(),
                              );
                              if (selected) {
                                setSelectedFacility(selected);
                                form.setValue('facility', selected.placeId);
                                setFacilityQuery(selected.name);
                              }
                              setOpenFacility(false);
                            }}
                          >
                            {facility.name}{facility.address ? `, ${facility.address}` : ''}
                            <Check
                              className="ml-auto h-4 w-4 opacity-0 data-[selected=true]:opacity-100"
                              data-selected={facility.placeId === selectedFacility?.placeId}
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
            {form.formState.errors.facility?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            {...form.register('experience')}
            id="experience"
            type="number"
          />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.experience?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="registrationNumber">Medical Registration Number</Label>
          <Input
            {...form.register('registrationNumber')}
            id="registrationNumber"
            type="text"
          />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.registrationNumber?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="medicalLicense">Medical License</Label>
          <Input
            type="file"
            accept=".pdf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  const base64String = await fileToBase64(file);
                  form.setValue('medicalLicense', base64String);
                } catch (error) {
                  console.error('Error converting file to base64:', error);
                }
              }
            }}
          />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.medicalLicense?.message}
          </p>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex justify-end border-t border-t-border bg-background px-6 py-4 sm:px-12">
        <Button
          size="lg"
          disabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          {form.formState.isSubmitting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            'Next'
          )}
        </Button>
      </div>
    </form>
  );
}