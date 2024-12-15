import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '@/context/auth-context'
import { Label } from '../ui/label'

const professionalDetailsSchema = z.object({
  specialty: z.string(),
  subSpecialty: z.string(),
  experience: z.string().refine((value) => parseInt(value) > 0, {
    message: 'Experience must be greater than 0',
  }),
  registerionNumber: z.string(),
  medicalLicense: z
    .instanceof(File)
    .optional()
    .refine((file) => file && file.size <= 5 * 1024 * 1024, {
      message: 'Medical license must be less than 5MB',
    })
    .refine((file) => file && ['application/pdf'].includes(file.type), {
      message: 'Medical license must be a PDF file',
    }),
  academicCertification: z
    .instanceof(File)
    .optional()
    .refine((file) => file && file.size <= 5 * 1024 * 1024, {
      message: 'Academic certification must be less than 5MB',
    })
    .refine((file) => file && ['application/pdf'].includes(file.type), {
      message: 'Academic certification must be a PDF file',
    }),
  facility: z.string(),
})
export type ProfessionalDetails = z.infer<typeof professionalDetailsSchema>

export default function ProffesionalDetails() {
  const { formData, updateFormData, nextStep, prevStep } =
    useContext(AuthContext)
  const {
    handleSubmit,
    setValue,
    register,
    formState: { errors },
  } = useForm<ProfessionalDetails>({
    resolver: zodResolver(professionalDetailsSchema),
    defaultValues: formData,
  })

  const onSubmit = (values: ProfessionalDetails) => {
    updateFormData(values)
    nextStep()
  }
  return (
    <Card className="m-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Proffesional Details</CardTitle>
        <CardDescription>Step 2/3</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select onValueChange={(value) => setValue('specialty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specialty1">Specialty 1</SelectItem>
                  <SelectItem value="specialty 2">Specialty 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.specialty && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.specialty.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="subSpecialty">Sub Specialty</Label>
              <Select
                onValueChange={(value) => setValue('subSpecialty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subSpecialty1">Sub-Specialty 1</SelectItem>
                  <SelectItem value="subSpecialty2">Sub-Specialty 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.subSpecialty && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.subSpecialty.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                {...register('experience')}
                id="experience"
                type="number"
              />
              {errors.experience && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="registerionNumber">
                Medical Registration Number
              </Label>
              <Input
                {...register('registerionNumber')}
                id="registerionNumber"
                type="text"
              />
              {errors.registerionNumber && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.registerionNumber.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="medicalLicense">Medical License</Label>
              <Input
                type="file"
                accept=".pdf"
                value=""
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setValue('medicalLicense', file)
                }}
              />
              {errors.medicalLicense && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.medicalLicense.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="academicCertification">
                Academic Certificate
              </Label>
              <Input
                type="file"
                accept=".pdf"
                value=""
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setValue('academicCertification', file)
                }}
              />
              {errors.academicCertification && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.academicCertification.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="facility">Facility</Label>
              <Select onValueChange={(value) => setValue('facility', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subSpecialty1">Facilityy 1</SelectItem>
                  <SelectItem value="subSpecialty2">Facility 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.facility && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.facility.message}
                </p>
              )}
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
