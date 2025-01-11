'use client'

import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Input } from './ui/input'
import { AnimatePresence } from 'framer-motion'
import { Label } from './ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@web/trpc/react'
import { useToast } from '@web/hooks/use-toast'
import { Loader } from 'lucide-react'

const loginSchema = z.object({
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
  password: z.string().min(8),
})

type FormValues = z.infer<typeof loginSchema>

export default function PhoneNumberForm() {
  const [step, setStep] = useState<'phone' | 'password'>('phone')

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  })

  const { toast } = useToast()
  const { mutateAsync: validatePhone, isPending: validatePhonePending } =
    api.auth.patients.phoneValidation.useMutation()

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const phoneValue = form.getValues('phone')
    form.trigger('phone').then(async (isValid) => {
      if (isValid) {
        try {
          const res = await validatePhone(phoneValue)
          if (res.success) {
            toast({
              title: 'Phone number validated',
              description: 'Provide your password to continue',
            })
            setStep('password')
          } else {
            toast({
              title: 'No account found',
              description: 'Redirecting you to sign up...',
              variant: 'destructive',
            })
          }
        } catch (error) {
          console.error(error)
          toast({
            title: 'Error',
            description: 'Validation failed,pleasetry again',
            variant: 'destructive',
          })
        }
      }
    })
  }

  const handleLoginSubmit = form.handleSubmit((data) => {
    console.log('Step 2 - Login:', data)
  })

  return (
    <Card className="m-auto flex w-[350px] flex-col gap-8 rounded-xl border shadow-sm xl:w-[400px]">
      <CardHeader className="flex flex-col items-start gap-0.5">
        <CardTitle className="text-2xl font-semibold text-primary">
          {step === 'password' ? 'Enter password 🔑' : 'Welcome back 👋🏽'}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {step === 'phone'
            ? 'Enter your phone number to continue'
            : 'Please enter your password'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form
          onSubmit={step === 'phone' ? handlePhoneSubmit : handleLoginSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col items-start gap-2">
            <Label htmlFor="phone" className="text-start text-foreground">
              Phone number
            </Label>
            <Input
              {...form.register('phone')}
              id="phone"
              type="tel"
              placeholder="Phone number"
              disabled={step === 'password'}
              className="text-foreground"
            />
            {form.formState.errors.phone && (
              <span className="text-sm font-medium text-destructive">
                {form.formState.errors.phone.message}
              </span>
            )}
          </div>

          <AnimatePresence>
            {step === 'password' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col items-start gap-2"
              >
                <Label
                  htmlFor="password"
                  className="text-start text-foreground"
                >
                  Password
                </Label>
                <Input
                  {...form.register('password')}
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoFocus
                />
                {form.formState.errors.password && (
                  <span className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full"
            disabled={validatePhonePending || form.formState.isSubmitting}
          >
            {validatePhonePending ? (
              <>
                <Loader className={`animate-spin`} />
                Validating...
              </>
            ) : step === 'phone' ? (
              'Continue'
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
