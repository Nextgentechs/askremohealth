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
const personalDetailsSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'First name must be at least 2 characters long' }),
    lastName: z
      .string()
      .min(2, { message: 'Last name must be at least 2 characters long' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().regex(/^\d{10,12}$/, {
      message: 'Phone number must be between 10-12 digits',
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
              {errors.firstName && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input {...register('lastName')} id="lastName" type="text" />
              {errors.lastName && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input {...register('email')} id="email" type="email" />
              {errors.email && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input {...register('phone')} id="phone" type="tel" />
              {errors.phone && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input {...register('password')} id="password" type="password" />
              {errors.password && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.password.message}
                </p>
              )}
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
              {errors.confirmPassword && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="bio" className="mb-2 block">
                Bio
              </Label>

              <Textarea {...register('bio')} id="bio" />
              {errors.bio && (
                <p className="text-destructive text-[0.8rem] font-medium">
                  {errors.bio.message}
                </p>
              )}
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
