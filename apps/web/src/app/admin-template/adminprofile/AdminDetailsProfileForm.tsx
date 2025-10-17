"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { useToast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
import { Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { adminSchema } from '@web/server/api/validators'
import type { AdminSchema } from '@web/server/api/validators'
import { useEffect } from 'react'

export default function AdminDetailsProfileForm() {
  // Fetch current admin info
  const [user] = api.users.currentUser.useSuspenseQuery()
  const { data: admin } = api.adminuser.getCurrentAdmin.useQuery()

  const form = useForm<AdminSchema>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: admin?.phone ?? user?.phone ?? '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      onboardingComplete: admin?.onboardingComplete ?? false,
      permissions: admin?.permissions ?? [],
    },
  })

  const { toast } = useToast()
  const { mutateAsync } = api.adminuser.updateAdminDetails.useMutation()

  // Reset form when user/admin data updates
  useEffect(() => {
    if (user && admin) {
      form.reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: admin.phone ?? user.phone ?? '',
        password: '',
        confirmPassword: '',
        role: 'admin',
        onboardingComplete: admin.onboardingComplete ?? false,
        permissions: admin.permissions ?? [],
      })
    }
  }, [user, admin, form])

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await mutateAsync(data)
      if (res.success) {
        toast({
          title: 'Profile updated',
          description: 'Your admin profile has been successfully updated.',
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error updating profile',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    }
  })

  return (
    <form className="space-y-8 max-w-md mx-auto" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3">
        {/* First Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input {...form.register('firstName')} id="firstName" type="text" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.firstName?.message}
          </p>
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input {...form.register('lastName')} id="lastName" type="text" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.lastName?.message}
          </p>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input {...form.register('email')} id="email" type="email" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.email?.message}
          </p>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input {...form.register('phone')} id="phone" type="tel" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.phone?.message}
          </p>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input {...form.register('password')} id="password" type="password" />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.password?.message}
          </p>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            {...form.register('confirmPassword')}
            id="confirmPassword"
            type="password"
          />
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.confirmPassword?.message}
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
