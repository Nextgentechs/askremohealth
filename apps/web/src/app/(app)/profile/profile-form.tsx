'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { toast, useToast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
import { Loader } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
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
  dob: z.string(),
})

export function ProfileForm() {
  const { data: currentUser } = api.users.currentUser.useQuery()

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone ?? '',
      dob: currentUser?.dob?.toISOString().split('T')[0] ?? '',
    },
  })
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()
  const { mutateAsync, isPending } = api.users.updateProfile.useMutation()

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      await mutateAsync(data)
      await utils.users.currentUser.invalidate()
      router.refresh()
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile has been updated successfully',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Failed to update profile',
        description: 'An error occurred while updating your profile',
        variant: 'destructive',
      })
    }
  }
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid w-full max-w-3xl gap-4 rounded-xl border p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...form.register('firstName')}
            type="text"
            placeholder="First Name"
          />
          {form.formState.errors.firstName && (
            <p className="text-xs font-medium text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...form.register('lastName')}
            type="text"
            placeholder="Last Name"
          />
          {form.formState.errors.lastName && (
            <p className="text-xs font-medium text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...form.register('email')}
            type="email"
            placeholder="Email"
          />
          {form.formState.errors.email && (
            <p className="text-xs font-medium text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...form.register('phone')}
            type="text"
            placeholder="Phone"
          />
          {form.formState.errors.phone && (
            <p className="text-xs font-medium text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            {...form.register('dob')}
            type="date"
            placeholder="Date of Birth"
          />
          {form.formState.errors.dob && (
            <p className="text-xs font-medium text-destructive">
              {form.formState.errors.dob.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex w-full justify-end">
        <Button
          type="submit"
          disabled={!form.formState.isDirty || isPending}
          className="flex items-center gap-2"
        >
          {isPending ? <Loader className="h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </form>
  )
}

const passwordSchema = z
  .object({
    oldPassword: z.string().min(8, { message: 'Old password is required' }),
    newPassword: z.string().min(8, { message: 'New password is required' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Confirm password is required' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function UpdatePassword() {
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  })

  const { mutateAsync, isPending } = api.users.updatePassword.useMutation()

  const onSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
      toast({
        title: 'Password updated successfully',
        description: 'Your password has been updated successfully',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Failed to update password',
        description: 'An error occurred while updating your password',
        variant: 'destructive',
      })
    }
  }
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid w-full max-w-md gap-4 rounded-xl border p-6 shadow-sm"
    >
      <div>
        <Label htmlFor="oldPassword">Old Password</Label>
        <Input
          id="oldPassword"
          {...form.register('oldPassword')}
          type="password"
        />
        {form.formState.errors.oldPassword && (
          <p className="text-xs font-medium text-destructive">
            {form.formState.errors.oldPassword.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          {...form.register('newPassword')}
          type="password"
        />
        {form.formState.errors.newPassword && (
          <p className="text-xs font-medium text-destructive">
            {form.formState.errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          {...form.register('confirmPassword')}
          type="password"
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-xs font-medium text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="mt-4 flex w-full justify-end">
        <Button
          type="submit"
          disabled={!form.formState.isValid || isPending}
          className="flex items-center gap-2"
        >
          {isPending ? <Loader className="animate-spin" /> : null}
          Update Password
        </Button>
      </div>
    </form>
  )
}
