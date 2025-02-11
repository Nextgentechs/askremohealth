'use client'

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@web/components/ui/form'
import { Input } from '@web/components/ui/input'
import { Button } from '@web/components/ui/button'
import { useToast } from '@web/hooks/use-toast'
import { useRouter } from 'next/navigation'

const loginSchema = z.object({
  phone: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .max(13, { message: 'Phone number must be at most 13 digits' }),
  password: z.string().min(8),
})

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  })

  const { toast } = useToast()
  const router = useRouter()

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (data.user.role !== 'admin') {
        toast({
          title: 'Login failed',
          description: 'Invalid phone number or password',
        })
        return
      }

      router.push('/admin/doctors')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Login failed',
        description: 'Invalid phone number or password',
      })
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 254712344567"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel>Password</FormLabel>
              </div>

              <FormControl>
                <Input id="password" type="password" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Form>
  )
}
