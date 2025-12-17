'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { useToast } from '@web/hooks/use-toast'
import type { PatientDetails } from '@web/server/api/validators'
import { patientDetailsSchema } from '@web/server/api/validators'
import { api } from '@web/trpc/react'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

export default function PatientDetailsForm() {
  const [user] = api.users.currentUser.useSuspenseQuery()
  const form = useForm<PatientDetails>({
    resolver: zodResolver(patientDetailsSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: '',
      dob: '',
      emergencyContact: '',
    },
  })
  const router = useRouter()
  const { toast } = useToast()
  const { mutateAsync } = api.patients.updatePatientDetails.useMutation()

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await mutateAsync(data)
      if (res.success) {
        router.push('/patient/upcoming-appointments')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occurred',
        description: 'Please try again',
        variant: 'destructive',
      })
    }
  })

  return (
    <form className="space-y-8 max-w-md mx-auto">
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input {...form.register('firstName')} id="firstName" type="text" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.firstName?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input {...form.register('lastName')} id="lastName" type="text" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.lastName?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input {...form.register('email')} id="email" type="email" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.email?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            {...form.register('phone')}
            id="phone"
            type="tel"
            placeholder="+254712345678 or 0712345678"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            International format supported
          </p>
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.phone?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            {...form.register('dob')}
            id="dob"
            type="date"
            // Max: Today (no future dates), Min: 120 years ago
            min={
              new Date(Date.now() - 120 * 365.25 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
            }
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.dob?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            {...form.register('emergencyContact')}
            id="emergencyContact"
            type="tel"
            placeholder="+254712345678 or 0712345678"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            Phone number of a trusted contact
          </p>
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.emergencyContact?.message}
          </p>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex justify-end border-t border-t-border bg-background px-6 py-4 sm:px-12">
        <Button
          size="lg"
          disabled={form.formState.isSubmitting}
          onClick={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          {form.formState.isSubmitting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            'Next'
          )}
        </Button>
      </div>
    </form>
  )
}
