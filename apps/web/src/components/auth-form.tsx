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
import { signIn } from 'next-auth/react'
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

export default function AuthForm() {
  const [currentStep, setCurrentStep] = useState<'login' | 'signup' | 'otp'>(
    'login',
  )
  const [loggedInEmail, setLoggedInEmail] = useState<string>('')
  


  return (
    <AnimatePresence mode="wait">
      {currentStep === 'otp' && (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <InputOTPForm loggedInEmail={loggedInEmail} />
        </motion.div>
      )}
      {currentStep === 'signup' && (
        <motion.div
          key="signup"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <SignUp setCurrentStep={setCurrentStep} />
        </motion.div>
      )}
      {currentStep === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Login setLoggedInEmail={setLoggedInEmail} setCurrentStep={setCurrentStep} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema
})

type LoginFormData = z.infer<typeof loginSchema>

function Login({
  setLoggedInEmail,
  setCurrentStep,
}: {
    setLoggedInEmail: React.Dispatch<React.SetStateAction<string>>,
    setCurrentStep: (step: 'login' | 'signup' | 'otp') => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }

  })

  async function onSubmit(data:LoginFormData) {
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
        const otpRes = await fetch('/api/auth/sendotp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            otp: result.otp
          }),
        })

        const otpResult = await otpRes.json()
        
        if (otpResult?.error?.message) {
          toast({
            title: 'OTP Error',
            description: otpResult.error.message ?? 'Failed to send OTP',
            variant: 'destructive',
          })
          return
        }

        toast({
          title: 'Success',
          description: 'Logged in successfully!',
          duration: 3000,
        })
        toast({
          title: 'Success',
          description: 'OTP has been sent to your email!',
          duration: 3000,
        })
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

  async function handleGoogleSignIn() {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch {
      toast({
        title: 'Error',
        description: 'Google sign-in failed',
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
          <CardTitle className="text-xl">Login to your account</CardTitle>
          <CardDescription>
            Sign in with your email or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Google className="h-5 w-5" />
            Sign in with Google
          </Button>
          <div className="relative my-2 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
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
                Don&apos;t have an account?{' '}
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


const signUpSchema = z
  .object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  confirmPassword: passwordSchema,
  role:z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type SignUpFormData = z.infer<typeof signUpSchema>

function SignUp({
  setCurrentStep,
}: {
  setCurrentStep: (step: 'login' | 'signup' | 'otp') => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const role = searchParams.get("role")


  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword:'',
      role : role ?? ''
    }
    
  })
  const router = useRouter()

  async function onSubmit(data:SignUpFormData) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Success', description: 'Sign up was successful!' })
        router.push('/auth') // Redirect to your desired page
      } else {
        toast({
          title: 'Error',
          description: result.error ?? 'Sign up failed',
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
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Sign up with your email or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => signIn('google', { callbackUrl: '/specialist/upcoming-appointments' })}
            disabled={isLoading}
          >
            <Google className="h-5 w-5" />
            Sign up with Google
          </Button>
          <div className="relative my-2 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
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

const FormSchema = z.object({
  pin: z.string().min(6, { message: 'Invalid OTP' }),
})

function InputOTPForm({loggedInEmail}:{loggedInEmail:string}) {
  const [isLoading, setIsLoading] = useState(false)
  const [resendIsLoading, setResendIsLoading] = useState(false)


  const router = useRouter()
  type UserRole = 'patient' | 'doctor'

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
          router.push('/')
        }
        else if (user?.role === 'doctor' && user?.onboardingComplete) {
          router.push('/specialist/upcoming-appointments')
        }
        else {
          router.push('/specialist/onboarding/personal-details')
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
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
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
                <Button type="submit" disabled={isLoading ?? resendIsLoading}>
                  {isLoading ? <Loader className="animate-spin" /> : 'Submit'}
                </Button>
                <Button onClick={handleResend} variant="outline" disabled={isLoading ?? resendIsLoading}>
                  {resendIsLoading ? <Loader className="animate-spin" /> : 'Resend'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

function Google(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 533.5 544.3">
      <path
        fill="#4285f4"
        d="M533.5 278.4c0-17.4-1.4-34.1-4-50.4H272v95.4h147.6c-6.3 34.1-25 62.9-53.4 82.2l86.3 67c50.2-46.3 80-114.7 80-194.2z"
      />
      <path
        fill="#34a853"
        d="M272 544.3c72.6 0 133.5-24.1 178-65.4l-86.3-67c-24 16-54.6 25.5-91.7 25.5-70.5 0-130.3-47.6-151.6-111.2l-88.9 69c43.9 86.5 134 149.1 240.5 149.1z"
      />
      <path
        fill="#fbbc04"
        d="M120.4 325.8C114.8 310.2 111.7 293.1 111.7 275s3.1-35.2 8.6-50.8L31.5 153.7C11.4 192.4 0 232.7 0 275s11.4 82.6 31.5 121.3l88.9-70.5z"
      />
      <path
        fill="#ea4335"
        d="M272 109.7c39.5 0 75.1 13.6 103.1 40.5l77.3-77.3C407.1 27.5 351.4 0 272 0 165.5 0 75.4 62.6 31.5 153.7l88.9 70.5C141.7 157.3 201.5 109.7 272 109.7z"
      />
    </svg>
  )
}
