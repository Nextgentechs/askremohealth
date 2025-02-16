'use client'
import React from 'react'
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
import { type SVGProps } from 'react'
import { useState } from 'react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp'
import { useForm } from 'react-hook-form'
import { toast } from '@web/hooks/use-toast'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@web/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { type OAuthStrategy } from '@clerk/types'
import { useRouter, useSearchParams } from 'next/navigation'

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
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const { signIn, setActive, isLoaded } = useSignIn()
  const params = useSearchParams()
  const redirectUrl = params.get('redirect_url') ?? '/appointments'

  function signInWith(strategy: OAuthStrategy) {
    return signIn
      ?.authenticateWithRedirect({
        strategy,
        redirectUrl: '/auth/sso-callback',
        redirectUrlComplete: redirectUrl,
      })
      .catch((err) => {
        console.log(err.errors)
        console.error(err, null, 2)
      })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    if (!isLoaded) {
      return
    }

    try {
      const signInAttempt = await signIn?.create({
        identifier: loginForm.email,
        password: loginForm.password,
      })
      if (signInAttempt?.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          redirectUrl: redirectUrl,
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        color: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login to complete your booking</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signInWith('oauth_google')}
                >
                  <Google className="mr-2 h-4 w-4" />
                  Login with Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
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
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !loginForm.email || !loginForm.password || isLoading
                  }
                >
                  {isLoading ? <Loader className="animate-spin" /> : 'Login'}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentStep('signup')}
                  className="underline underline-offset-4"
                >
                  Sign up
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </div>
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
  const { isLoaded, signUp } = useSignUp()
  const { signIn } = useSignIn()
  const params = useSearchParams()
  const redirectUrl = params.get('redirect_url') ?? '/appointments'
  if (!signIn) {
    return null
  }

  function signInWith(strategy: OAuthStrategy) {
    return signIn
      ?.authenticateWithRedirect({
        strategy,
        redirectUrl: '/auth/sso-callback',
        redirectUrlComplete: redirectUrl,
      })
      .catch((err) => {
        console.log(err.errors)
        console.error(err, null, 2)
      })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    if (!isLoaded) {
      return
    }

    try {
      await signUp.create({
        firstName: signUpForm.firstName,
        lastName: signUpForm.lastName,
        emailAddress: signUpForm.email,
        password: signUpForm.password,
        redirectUrl: redirectUrl,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setCurrentStep('otp')
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
        })
      } else {
        toast({
          title: 'Error',
          description: 'An error occurred',
          color: 'destructive',
        })
      }
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
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signInWith('oauth_google')}
                >
                  <Google className="mr-2 h-4 w-4" />
                  Sign up with Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="flex flex-row justify-between gap-2">
                  <div className="grid gap-2">
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
                      placeholder="John"
                    />
                  </div>
                  <div className="grid gap-2">
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
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={signUpForm.email}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
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
              </div>
              <div id="clerk-captcha"></div>
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
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Invalid OTP',
  }),
})

function InputOTPForm() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  })
  const { toast } = useToast()
  const { isLoaded, signUp, setActive } = useSignUp()
  const params = useSearchParams()
  const redirectUrl = params.get('redirect_url') ?? '/appointments'

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: data.pin,
      })

      if (signUpAttempt.status === 'complete') {
        setActive({ session: signUpAttempt.createdSessionId, redirectUrl })
        toast({
          title: 'Account created',
          description: 'Redirecting...',
        })
      }
    } catch (error) {
      console.error(error)
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
        <CardContent className="flex items-center justify-center text-center">
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem className="mx-auto w-full">
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Google(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 256 262"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
      {...props}
    >
      <path
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        fill="#4285F4"
      />
      <path
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        fill="#34A853"
      />
      <path
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        fill="#FBBC05"
      />
      <path
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        fill="#EB4335"
      />
    </svg>
  )
}
