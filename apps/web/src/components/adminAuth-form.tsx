'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { Input } from '@web/components/ui/input'
import { toast } from '@web/hooks/use-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader } from 'lucide-react'
import React, { useState, type SVGProps } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp'
import { passwordSchema } from '@web/server/api/validators'
import { useCurrentUser } from '@web/hooks/use-current-user'

// Zod schema for the admin signup form
const adminSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type AdminSignupFormData = z.infer<typeof adminSignupSchema>

export default function AdminAuthForm() {
  const [currentStep, setCurrentStep] = useState<'login' | 'signup' | 'otp'>('login')
  const [loggedInEmail, setLoggedInEmail] = useState('')

  return (
    <>
      {currentStep === 'otp' && <InputOTPForm loggedInEmail={loggedInEmail} />}
      {currentStep === 'signup' && (
        <SignUp setCurrentStep={setCurrentStep} />
      )}
      {currentStep === 'login' && (
        <Login
          setLoggedInEmail={setLoggedInEmail}
          setCurrentStep={setCurrentStep}
        />
      )}
    </>
  )
}

// Login form for admins
function Login({
  setLoggedInEmail,
  setCurrentStep,
}: {
  setLoggedInEmail: React.Dispatch<React.SetStateAction<string>>
  setCurrentStep: (step: 'login' | 'signup' | 'otp') => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: { email: string; password: string }) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (result.success) {
        setLoggedInEmail(data.email)
        setCurrentStep('otp')
      } else {
        toast({
          title: 'Error',
          description: result.error ?? 'Login failed',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Admin Login</CardTitle>
          <CardDescription>Sign in with your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader className="animate-spin" /> : 'Login'}
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentStep('signup')}
                  className="underline underline-offset-4"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

// Signup form for admins
function SignUp({
  setCurrentStep,
}: {
  setCurrentStep: (step: 'login' | 'signup' | 'otp') => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<AdminSignupFormData>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: AdminSignupFormData) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          role: 'admin', // Role is explicitly set to 'admin' in the backend
        }),
      })
      const result = await res.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Sign Up was successful!',
          duration: 3000,
        })
        setCurrentStep('otp')
      } else {
        toast({
          title: 'Error',
          description: result.error ?? 'Sign Up failed',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unknown error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 mt-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Admin Sign Up</CardTitle>
          <CardDescription>Create a new admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader className="animate-spin" /> : 'Sign Up'}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentStep('login')}
                  className="underline underline-offset-4"
                >
                  Login
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

// OTP verification form (shared logic)

const FormSchema = z.object({
  pin: z.string().min(6, { message: 'Invalid OTP' }),
})

function InputOTPForm({loggedInEmail}:{loggedInEmail:string}) {
  const [isLoading, setIsLoading] = useState(false)
  const [resendIsLoading, setResendIsLoading] = useState(false)
  const router = useRouter()
  type UserRole = 'patient' | 'doctor' | 'admin' | 'lab'

  type User = {
    id: string
    email: string
    role: UserRole
    onboardingComplete: boolean
  }

  const { user } = useCurrentUser() as { user: User | null }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: '' },
  })


  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/verifyotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: data.pin, email: loggedInEmail }),
      })

      const result = await res.json()
      if (result.success) {
        toast({
          title: 'Success',
          description: 'OTP verified successfully!',
          duration: 3000,
        })
        if (user?.role === 'patient') {
          if (!user?.onboardingComplete) {
            router.push('/patient/onboarding/patient-details')
          } else {
            router.push('/patient/upcoming-appointments')
          }
        }
        else if (user?.role === 'doctor') {
          if (!user?.onboardingComplete) {
            router.push('/specialist/onboarding/personal-details')
          } else {
            router.push('/specialist/upcoming-appointments')
          }
        }
        else if (user?.role === 'admin') {
          router.push('/admin/doctors')
        }
        else {
          // Fallback for any other roles or undefined roles, perhaps redirect to a generic home or login page
          router.push('/')
        }
      }
      else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResend() {
    setResendIsLoading(true)
    try {
      const response = await fetch('api/auth/resendotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({email:loggedInEmail})
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? 'Something went wrong');
      }

      toast({
        title: 'Success',
        description: 'OTP sent successfully!',
        duration: 3000,
      });
  
    }
    catch {
      toast({
        title: 'Error',
        description: 'Failed to resend OTP',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setResendIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Enter your one-time password
          </CardTitle>
          <CardDescription>
            Please enter the one-time password sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem className="text-center items-center">
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup className="mx-auto">
                          {[...Array(6)].map((_, i) => (
                            <InputOTPSlot key={i} index={i} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-between w-full'>
                <Button onClick={handleResend} variant="outline" disabled={isLoading ?? resendIsLoading}>
                  {resendIsLoading ? <Loader className="animate-spin" /> : 'Resend'}
                </Button>
                <Button type="submit" disabled={isLoading ?? resendIsLoading}>
                  {isLoading ? <Loader className="animate-spin" /> : 'Submit'}
                </Button>

              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}