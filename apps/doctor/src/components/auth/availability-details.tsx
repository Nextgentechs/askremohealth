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
import { api } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from '@tanstack/react-router'
import { Checkbox } from '../ui/checkbox'

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
  opening: z.string(),
  closing: z.string(),
  isOpen: z.boolean(),
})

const availabilityDetailsSchema = z.object({
  appointmentDuration: z.string(),
  operatingHours: z.array(operatingHoursSchema),
})
export type AvailabilityDetails = z.infer<typeof availabilityDetailsSchema>

export default function AvailabilityDetails() {
  const router = useRouter()
  const utils = api.useUtils()

  const { formData, prevStep } = useContext(AuthContext)
  const methods = useForm<AvailabilityDetails>({
    resolver: zodResolver(availabilityDetailsSchema),
    defaultValues: formData,
  })
  const { toast } = useToast()

  const { mutateAsync, isPending } = api.auth.doctor.signup.useMutation({
    onSuccess: () => {
      toast({
        description: 'Signup successful,log in to continue!',
        variant: 'default',
      })
    },
  })

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      const finalValues = { ...formData, ...values }
      await mutateAsync(finalValues)
      await utils.invalidate()
      await utils.users.currentUser.refetch()
      await router.invalidate()
      router.navigate({ to: '/auth/login' })
    } catch (err) {
      toast({
        description: err.message,
        variant: 'destructive',
      })
      console.error(err)
    }
  })

  return (
    <Card className="mx-auto my-10 w-full max-w-4xl md:my-auto">
      <CardHeader>
        <CardTitle>Availability Details</CardTitle>
        <CardDescription>Step 3/3</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-4">
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

          <div className="flex w-full flex-col items-start gap-4 border-t px-2 pt-4">
            <div className="flex flex-row items-start justify-start gap-1">
              <Checkbox required />
              <label
                htmlFor="terms"
                className="text-muted-foreground text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm that I am a licensed medical practitioner and all
                information provided is accurate and up to date
              </label>
            </div>

            <div className="flex flex-row items-center justify-center gap-1">
              <Checkbox required />
              <label
                htmlFor="terms"
                className="text-muted-foreground text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I consent to credential verification and background checks
              </label>
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
              <span>
                {' '}
                {isPending ? 'Processing...' : 'Complete Registration'}
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
