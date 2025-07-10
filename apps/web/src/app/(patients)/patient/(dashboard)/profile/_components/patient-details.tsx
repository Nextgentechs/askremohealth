"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { useToast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
import { Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { patientDetailsSchema } from '@web/server/api/validators'
import type { PatientDetails } from '@web/server/api/validators'
import { useEffect } from 'react'

export default function PatientDetailsProfileForm() {
  // Fetch user fields (firstName, lastName, email, phone)
  const [user] = api.users.currentUser.useSuspenseQuery()
  // Fetch patient fields (dob, emergencyContact, phone)
  const { data: patient } = api.patients.getCurrentPatient.useQuery()

  const form = useForm<PatientDetails>({
    resolver: zodResolver(patientDetailsSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: patient?.phone ?? user?.phone ?? '',
      dob: patient?.dob ?? '',
      emergencyContact: patient?.emergencyContact ?? '',
    },
  })
  const { toast } = useToast()
  const { mutateAsync } = api.patients.updatePatientDetails.useMutation()

  // Reset form values when patient or user data changes
  useEffect(() => {
    if (user && patient) {
      form.reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: patient.phone ?? user.phone ?? '',
        dob: patient.dob ?? '',
        emergencyContact: patient.emergencyContact ?? '',
      })
    }
  }, [user, patient, form])

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await mutateAsync(data)
      if (res.success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile details have been updated.',
        })
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
    <form className="space-y-8 max-w-md mx-auto" onSubmit={onSubmit}>
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
          <Input {...form.register('phone')} id="phone" type="tel" />
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
            max={
              new Date(Date.now() - 10 * 365.25 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
            }
          />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.dob?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input {...form.register('emergencyContact')} id="emergencyContact" type="text" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.emergencyContact?.message}
          </p>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            'Update Profile'
          )}
        </Button>
      </div>
    </form>
  )
}
