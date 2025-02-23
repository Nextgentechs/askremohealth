'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Card, CardContent, CardHeader } from '@web/components/ui/card'
import { Checkbox } from '@web/components/ui/checkbox'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
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
import { api } from '@web/trpc/react'
import { ChevronDown } from 'lucide-react'
import React from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import {
  type ProfessionalDetails,
  professionalDetailsSchema,
} from '../../../onboarding/professional-details/_components/professional-details-form'

function SubSpecialtySelect({ specialty }: { specialty: string }) {
  const [open, setOpen] = React.useState(false)
  const { setValue, watch } = useFormContext<ProfessionalDetails>()
  const selectedSubSpecialties = watch('subSpecialty')

  const { data: subspecialties } = api.specialties.listSubSpecialties.useQuery({
    specialityId: specialty,
  })

  const selected = React.useMemo(() => {
    if (!subspecialties) return ''
    const names = subspecialties
      .filter((sub) => selectedSubSpecialties?.includes(sub.id))
      .map((sub) => sub.name)
    if (names.length === 0) return ''
    const joined = names.join(', ')
    return joined.length > 30 ? joined.slice(0, 30) + '...' : joined
  }, [subspecialties, selectedSubSpecialties])

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
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="flex flex-col">
          {subspecialties?.map((option) => (
            <div
              className="mb-1 flex w-full cursor-pointer flex-row gap-4 text-sm"
              key={option.id}
            >
              <Checkbox />
              <span> {option.name}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const updateProfessionalDetailsSchema = professionalDetailsSchema.omit({
  facility: true,
})

function ProfessionalInfoForm() {
  const [doctor] = api.doctors.currentDoctor.useSuspenseQuery()
  const [selectedSpecialty, setSelectedSpecialty] = React.useState(
    doctor?.specialty?.id,
  )
  const { data: specialties } = api.specialties.listSpecialties.useQuery()
  const { data: facilities } = api.facilities.listFacilities.useQuery()

  const methods = useForm<ProfessionalDetails>({
    resolver: zodResolver(professionalDetailsSchema),
    defaultValues: {
      experience: doctor?.experience ?? 0,
      registrationNumber: doctor?.licenseNumber ?? '',
      specialty: doctor?.specialty?.id,
      facility: doctor?.facility?.placeId,
    },
  })

  return (
    <Card className="w-full shadow-sm">
      <CardHeader></CardHeader>
      <CardContent>
        <form className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedSpecialty(value)
                  methods.setValue('specialty', value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={doctor?.specialty?.name} />
                </SelectTrigger>
                <SelectContent>
                  {specialties?.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.specialty?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="subSpecialty">Sub Specialty</Label>
              <FormProvider {...methods}>
                <SubSpecialtySelect specialty={selectedSpecialty ?? ''} />
              </FormProvider>

              <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.subSpecialty?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                {...methods.register('experience')}
                id="experience"
                type="number"
              />

              <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.experience?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="registerionNumber">
                Medical Registration Number
              </Label>
              <Input
                {...methods.register('registrationNumber')}
                id="registerionNumber"
                type="text"
              />

              <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.registrationNumber?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="facility">Facility</Label>
              <Select
                onValueChange={(value) => methods.setValue('facility', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={doctor?.facility?.name} />
                </SelectTrigger>
                <SelectContent>
                  {facilities?.map((facility) => (
                    <SelectItem key={facility.placeId} value={facility.placeId}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.facility?.message}
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline">Edit</Button>
            <Button type="submit" disabled>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ProfessionalInfo() {
  return (
    <div className="flex flex-col gap-6">
      <ProfessionalInfoForm />
      {/* <RegulatoryCertificates /> */}
    </div>
  )
}
