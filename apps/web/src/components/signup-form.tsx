'use client'
import { Button } from './ui/button'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from './ui/card'
import { z } from 'zod'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api, type RouterOutputs } from '@web/trpc/react'
import { useToast } from '@web/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react'

const signupSchema = z
  .object({
    firstName: z.string().min(2, { message: 'First name is required' }),
    lastName: z.string().min(2, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
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
    dob: z.string().min(10, { message: 'Date of birth is required' }),
    password: z.string().min(8, { message: 'Password is required' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function SignupForm({
  patient,
}: {
  patient: RouterOutputs['users']['patients']['details'] | null
}) {
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: patient?.user?.firstName ?? '',
      lastName: patient?.user?.lastName ?? '',
      email: patient?.user?.email ?? '',
      phone: patient?.user?.phone ?? '',
      dob: patient?.user?.dob
        ? new Date(patient?.user?.dob).toISOString().split('T')[0]
        : '',
      password: '',
      confirmPassword: '',
    },
  })

  const { toast } = useToast()
  const router = useRouter()
  const { mutateAsync: signup, isPending } =
    api.auth.patients.signup.useMutation()

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    try {
      const res = await signup(data)

      if (res.success) {
        toast({
          title: 'Signup successful',
          description: 'Redirecting to dashboard',
        })
        router.push('/login')
      } else {
        toast({
          title: 'Signup failed',
          description: 'Please try again',
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card className="m-auto flex w-full max-w-3xl flex-col gap-8 rounded-xl border shadow-sm">
      <CardHeader className="flex flex-col items-start gap-0.5">
        <CardTitle className="text-2xl font-semibold text-primary">
          Sign up
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {patient
            ? 'Complete your profile by setting up a password'
            : 'Sign up to book appointments and manage your healthcare easily.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-foreground">
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                {...form.register('firstName')}
              />
              {form.formState.errors.firstName && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" type="text" {...form.register('lastName')} />
              {form.formState.errors.lastName && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...form.register('phone')} />
              {form.formState.errors.phone && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" {...form.register('dob')} />
              {form.formState.errors.dob && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.dob.message}
                </p>
              )}
            </div>
          </div>
          <div className="w-full text-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
