'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select'
import { Textarea } from '@web/components/ui/textarea'
import { useToast } from '@web/hooks/use-toast'
import { fileToBase64 } from '@web/lib/utils'
import { api } from '@web/trpc/react'
import { Loader } from 'lucide-react'
import { redirect, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

/** Maximum character length for bio field */
const BIO_MAX_LENGTH = 256

/**
 * Validation schema for doctor personal details onboarding
 * - Phone: International format supported (E.164)
 * - DOB: Minimum age 21 for medical professionals
 * - Bio: 10-256 characters with UI counter
 */
export const personalDetailsSchema = z.object({
  title: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select a gender',
  }),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime()) && date <= new Date()
      },
      { message: 'Date of birth cannot be in the future' },
    )
    .refine(
      (val) => {
        const date = new Date(val)
        const today = new Date()
        const ageInYears =
          (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        return ageInYears >= 21
      },
      { message: 'Must be at least 21 years old to register as a doctor' },
    )
    .refine(
      (val) => {
        const date = new Date(val)
        const today = new Date()
        const ageInYears =
          (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        return ageInYears <= 100
      },
      { message: 'Please enter a valid date of birth' },
    ),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .transform((val) => val.replace(/[\s\-\(\)]/g, '')) // Remove formatting
    .refine(
      (val) => {
        // E.164 format: + followed by 7-15 digits
        if (/^\+[1-9]\d{6,14}$/.test(val)) return true
        // International without +: 7-15 digits starting with country code
        if (/^[1-9]\d{6,14}$/.test(val)) return true
        // Local Kenya format: 07xx or 01xx (10 digits)
        if (/^0[17]\d{8}$/.test(val)) return true
        return false
      },
      {
        message:
          'Please enter a valid phone number (e.g., +254712345678 or 0712345678)',
      },
    )
    .transform((val) => {
      // Normalize to E.164 format
      if (val.startsWith('+')) return val
      if (val.startsWith('0')) return `+254${val.slice(1)}`
      return `+${val}`
    }),

  bio: z
    .string()
    .min(10, { message: 'Bio must be at least 10 characters long' })
    .max(BIO_MAX_LENGTH, {
      message: `Bio must be at most ${BIO_MAX_LENGTH} characters long`,
    }),

  profilePicture: z.string().refine(
    (base64) => {
      if (!base64) return true
      const base64Data = base64.split(',')[1] ?? base64
      const sizeInBytes = (base64Data.length * 3) / 4
      return sizeInBytes <= 5 * 1024 * 1024
    },
    {
      message: 'Photo must be less than 5MB',
    },
  ),
})

export type PersonalDetails = z.infer<typeof personalDetailsSchema>

export default function PersonalDetails() {
  const [user] = api.users.currentUser.useSuspenseQuery()

  // if (!user) {
  //   redirect('/')
  // }

  if (user!.role !== 'doctor') {
    redirect('/')
  }

  if (user!.onboardingComplete === true) {
    redirect('/specialist/upcoming-appointments')
  }

  const form = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      title: '',
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: '',
      bio: '',
    },
  })

  const router = useRouter()
  const { toast } = useToast()
  const { mutateAsync } = api.doctors.updatePersonalDetails.useMutation()

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await mutateAsync(data)
      if (res.success) {
        router.push('/specialist/onboarding/professional-details')
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
    <form className="space-y-8">
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            {...form.register('title')}
            id="title"
            type="text"
            placeholder="e.g. Dr, Prof, etc."
          />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.title?.message}
          </p>
        </div>
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
          <Label htmlFor="gender">Gender</Label>
          <Select
            onValueChange={(value) => {
              form.setValue('gender', value as 'male' | 'female')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.gender?.message}
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
            // Min: 100 years ago, Max: 21 years ago (minimum age for doctors)
            min={
              new Date(Date.now() - 100 * 365.25 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
            }
            max={
              new Date(Date.now() - 21 * 365.25 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
            }
          />
          <p className="text-[0.8rem] text-muted-foreground">
            Must be at least 21 years old
          </p>
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.dob?.message}
          </p>
        </div>
        <div>
          <Label htmlFor="profilePicture">Profile Picture</Label>
          <Input
            id="profilePicture"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                try {
                  const base64String = await fileToBase64(file)
                  form.setValue('profilePicture', base64String)
                } catch (err) {
                  console.error('Error converting file to base64:', err)
                }
              }
            }}
          />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.profilePicture?.message}
          </p>
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            {...form.register('bio')}
            id="bio"
            className="h-24"
            maxLength={BIO_MAX_LENGTH}
            placeholder="Tell patients about yourself, your experience, and your approach to healthcare..."
          />
          <div className="flex justify-between text-[0.8rem]">
            <p className="font-medium text-destructive">
              {form.formState.errors.bio?.message}
            </p>
            <p
              className={`text-muted-foreground ${(form.watch('bio')?.length ?? 0) > BIO_MAX_LENGTH ? 'text-destructive' : ''}`}
            >
              {form.watch('bio')?.length ?? 0}/{BIO_MAX_LENGTH}
            </p>
          </div>
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
