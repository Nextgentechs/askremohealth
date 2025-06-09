'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { useToast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
import { useRouter } from 'next-nprogress-bar'
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
      phone: '',
      dob: '',
    },
  })
  const { toast } = useToast()
  const router = useRouter()
  const utils = api.useUtils()
  // const { mutateAsync, isPending } = api.users.updateProfile.useMutation()

  const onSubmit = async (_data: z.infer<typeof profileSchema>) => {
    try {
      // await mutateAsync(_data)
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
          // disabled={!form.formState.isDirty || isPending}
          disabled
          className="flex items-center gap-2"
        >
          {/* {isPending ? <Loader className="h-4 w-4 animate-spin" /> : null} */}
          Save Changes
        </Button>
      </div>
    </form>
  )
}

// Removed unused passwordSchema to resolve ESLint warning