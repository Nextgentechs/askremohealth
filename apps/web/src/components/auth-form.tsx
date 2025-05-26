'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { TRPCClientError } from '@trpc/client'
import { useRouter } from 'next/navigation'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { toast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
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

export default function AuthForm() {
  const [currentStep, setCurrentStep] = useState<'login' | 'signup' | 'otp'>(
    'login',
  )


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
          <InputOTPForm />
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
          <Login setCurrentStep={setCurrentStep} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Login({
  setCurrentStep,
}: {
  setCurrentStep: (step: 'login' | 'signup' | 'otp') => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      const result = await res.json()
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Logged in successfully!',
          duration: 3000,
        })
        // Optionally reload or redirect
        window.location.reload()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Login failed',
          variant: 'destructive',
        })
      }
    } catch (error) {
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
    } catch (error) {
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
          <form onSubmit={onSubmit}>
            <div className="grid gap-6">
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
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
              </div>
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



function SignUp({
  setCurrentStep,
}: {
  setCurrentStep: (step: 'login' | 'signup' | 'otp') => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [signUpForm, setSignUpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpForm),
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Success', description: 'Sign up was successful!' })
        router.push('/specialist/onboarding/personal-details') // Redirect to your desired page
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Sign up failed',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
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
          <form onSubmit={onSubmit}>
            <div className="grid gap-6">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => signIn('google', { callbackUrl: '/' })}
                disabled={isLoading}
              >
                <Google className="h-5 w-5" />
                Sign up with Google
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={signUpForm.firstName}
                      onChange={(e) =>
                        setSignUpForm({
                          ...signUpForm,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={signUpForm.lastName}
                      onChange={(e) =>
                        setSignUpForm({
                          ...signUpForm,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={signUpForm.email}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, email: e.target.value })
                  }
                />
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={signUpForm.password}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, password: e.target.value })
                  }
                />
              </div>
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const FormSchema = z.object({
  pin: z.string().min(6, { message: 'Invalid OTP' }),
})

function InputOTPForm() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: '' },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    try {
      console.log('OTP submitted:', data.pin)
    } finally {
      setIsLoading(false)
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader className="animate-spin" /> : 'Submit'}
              </Button>
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
