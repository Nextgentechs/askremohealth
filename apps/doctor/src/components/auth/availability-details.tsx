import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
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
import FacilityHours from '../facility-hours'
import { Button } from '../ui/button'
import { ChevronLeft } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '@/context/auth-context'
import { Label } from '../ui/label'

export const operatingHoursSchema = z.object({
  day: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  from: z.string(),
  to: z.string(),
  isOpen: z.boolean(),
})
const availabilityDetailsSchema = z.object({
  appointmentDuration: z.string(),
  operatingHours: z.array(operatingHoursSchema),
})
export type AvailabilityDetails = z.infer<typeof availabilityDetailsSchema>

export default function AvailabilityDetails() {
  const { formData, prevStep } = useContext(AuthContext)
  const methods = useForm<AvailabilityDetails>({
    resolver: zodResolver(availabilityDetailsSchema),
    defaultValues: formData,
  })

  const onSubmit = (values: AvailabilityDetails) => {
    console.log('third step values', values)
    console.log('formData', formData)
  }
  return (
    <Card className="m-auto w-full max-w-5xl">
      <CardHeader>
        <CardTitle>Availability Details</CardTitle>
        <CardDescription>Step 3/3</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid w-full grid-cols-2 justify-between gap-4">
            <div>
              <Label htmlFor="appointmentDuration">
                Average Appointment Duration
              </Label>
              <Select
                onValueChange={(value) =>
                  methods.setValue('appointmentDuration', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                </SelectContent>
              </Select>
              {methods.formState.errors.appointmentDuration && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {methods.formState.errors.appointmentDuration.message}
                </p>
              )}
            </div>

            <FormProvider {...methods}>
              <FacilityHours />
            </FormProvider>
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
              <span> Complete Registration</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
