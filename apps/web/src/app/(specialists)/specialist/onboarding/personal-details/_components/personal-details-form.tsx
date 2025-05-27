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
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const personalDetailsSchema = z.object({
  title: z.string().optional(),
  // firstName: z.string(),
  // lastName: z.string(),
  gender: z.enum(['male', 'female']),
  dob: z.string().min(1, 'Date of birth is required'),
  // email: z.string().email(),
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

  bio: z
    .string()
    .min(10, { message: 'Bio must be at least 10 characters long' })
    .max(256, { message: 'Bio must be at most 256 characters long' }),

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
  //console.log('Current user:', user)
  const form = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      title: '',
      // firstName: user?.firstName ?? '',
      // lastName: user?.lastName ?? '',

      //  email: user?.email ?? '',
      // phone: user?.phone ?? '',
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
        {/* <div className="flex flex-col gap-2">
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
        </div> */}
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
        {/* <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input {...form.register('email')} id="email" type="email" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.email?.message}
          </p>
        </div> */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input {...form.register('phone')} id="phone" type="tel" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.phone?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Date of Birth</Label>
          <Input
            {...form.register('dob')}
            id="dob"
            type="date"
            max={
              new Date(Date.now() - 25 * 365.25 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
            }
          />
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
          <Label htmlFor="bio" className="">
            Bio
          </Label>
          <Textarea {...form.register('bio')} id="bio" className="h-24" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.bio?.message}
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
