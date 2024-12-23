import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useContext, useState } from 'react'
import { AuthContext } from '@/context/auth-context'
import { Label } from '../ui/label'
import { api } from '@/lib/trpc'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Checkbox } from '../ui/checkbox'
import { fileToBase64 } from '@/lib/utils'

export const professionalDetailsSchema = z.object({
  specialty: z.string(),
  subSpecialty: z.array(z.string()),
  experience: z.string().refine((value) => parseInt(value) > 0, {
    message: 'Experience must be greater than 0',
  }),
  registrationNumber: z.string(),
  medicalLicense: z
    .string()
    .optional()
    .refine(
      (base64) => {
        if (!base64) return true
        const sizeInBytes = (base64.length * 3) / 4
        return sizeInBytes <= 5 * 1024 * 1024
      },
      {
        message: 'Medical license must be less than 5MB',
      },
    ),
  facility: z.string(),
})
export type ProfessionalDetails = z.infer<typeof professionalDetailsSchema>

function SubSpecialtySelect({ specialty }: { specialty: string }) {
  const [open, setOpen] = useState(false)
  const { setValue, watch } = useFormContext<ProfessionalDetails>()
  const selectedSubSpecialties = watch('subSpecialty')

  const { data: subspecialties } = api.specialties.listSubSpecialties.useQuery({
    specialityId: specialty,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex items-end justify-end disabled:cursor-not-allowed"
          disabled={!specialty}
        >
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
              <Checkbox
                checked={selectedSubSpecialties.includes(option.id)}
                onCheckedChange={(checked) => {
                  setValue(
                    'subSpecialty',
                    checked
                      ? [...selectedSubSpecialties, option.id]
                      : selectedSubSpecialties.filter((id) => id !== option.id),
                  )
                }}
              />
              <span> {option.name}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function ProffesionalDetails() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const { formData, updateFormData, nextStep, prevStep } =
    useContext(AuthContext)
  const methods = useForm<ProfessionalDetails>({
    resolver: zodResolver(professionalDetailsSchema),
    defaultValues: formData,
  })

  const [specialties] = api.specialties.listSpecialties.useSuspenseQuery()
  const [facilities] = api.facilities.list.useSuspenseQuery()

  const onSubmit = (values: ProfessionalDetails) => {
    updateFormData(values)
    nextStep()
  }
  return (
    <Card className="mx-auto my-10 w-full max-w-4xl md:my-auto">
      <CardHeader>
        <CardTitle>Proffesional Details</CardTitle>
        <CardDescription>Step 2/3</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedSpecialty(value)
                  methods.setValue('specialty', value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
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
                <SubSpecialtySelect specialty={selectedSpecialty} />
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
              <Label htmlFor="medicalLicense">Medical License</Label>
              <Input
                type="file"
                accept=".pdf"
                // value={formData.medicalLicense?.name}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    try {
                      const base64String = await fileToBase64(file)
                      methods.setValue('medicalLicense', base64String)
                    } catch (error) {
                      console.error('Error converting file to base64:', error)
                    }
                  }
                }}
              />

              <p className="text-destructive text-[0.8rem] font-medium">
                {methods.formState.errors.medicalLicense?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="facility">Facility</Label>
              <Select
                onValueChange={(value) => methods.setValue('facility', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
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

          <div className="flex flex-row justify-between">
            <Button
              type="button"
              variant={'outline'}
              onClick={() => prevStep()}
            >
              <ChevronLeft />
              <span>Back</span>
            </Button>
            <Button type="submit">
              <span> Next</span>
              <ChevronRight />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
