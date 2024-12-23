import { AuthContext } from '@/context/auth-context'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ChevronRight } from 'lucide-react'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { fileToBase64 } from '@/lib/utils'

export const personalDetailsSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'First name must be at least 2 characters long' }),
    lastName: z
      .string()
      .min(2, { message: 'Last name must be at least 2 characters long' }),
    dob: z.string().min(2, { message: 'Date of Birth is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z
      .string()
      .refine((val) => /^\d{10}$/.test(val) || /^254\d{9}$/.test(val), {
        message:
          'Phone number must be 10 digits starting with 07 or 01, or 12 digits starting with 254',
      })
      .refine(
        (val) =>
          val.startsWith('07') ||
          val.startsWith('01') ||
          val.startsWith('2547') ||
          val.startsWith('2541'),
        {
          message: 'Phone number must start with 07, 01, 2547, or 2541',
        },
      )
      .transform((val) => {
        if (val.startsWith('0')) {
          return `254${val.slice(1)}`
        }
        return val
      }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string().min(8, {
      message: 'Confirm password must be at least 8 characters long',
    }),
    bio: z
      .string()
      .min(10, { message: 'Bio must be at least 10 characters long' })
      .max(256, { message: 'Bio must be at most 256 characters long' }),

    profilePicture: z
      .string()
      .optional()
      .refine(
        (base64) => {
          if (!base64) return true
          const base64Data = base64.split(',')[1] || base64
          const sizeInBytes = (base64Data.length * 3) / 4
          return sizeInBytes <= 5 * 1024 * 1024
        },
        {
          message: 'Photo must be less than 5MB',
        },
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type PersonalDetails = z.infer<typeof personalDetailsSchema>

export default function PersonalDetails() {
  const { formData, updateFormData, nextStep } = useContext(AuthContext)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: formData,
  })

  const onSubmit: SubmitHandler<PersonalDetails> = (data) => {
    updateFormData(data)
    nextStep()
  }

  return (
    <Card className="m-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        <CardDescription>Step 1/3</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input {...register('firstName')} id="firstName" type="text" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.firstName?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input {...register('lastName')} id="lastName" type="text" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.lastName?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input {...register('email')} id="email" type="email" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.email?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input {...register('phone')} id="phone" type="tel" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.phone?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input {...register('password')} id="password" type="password" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.password?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="">
                Confirm Password
              </Label>
              <Input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
              />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.confirmPassword?.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Date of Birth</Label>
              <Input {...register('dob')} id="dob" type="date" />
              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.dob?.message}
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
                      setValue('profilePicture', base64String)
                    } catch (err) {
                      console.error('Error converting file to base64:', err)
                    }
                  }
                }}
              />
              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.profilePicture?.message}
              </p>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="bio" className="">
                Bio
              </Label>

              <Textarea {...register('bio')} id="bio" />

              <p className="text-destructive text-[0.8rem] font-medium">
                {errors.bio?.message}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <span>Next</span>
              <ChevronRight />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
