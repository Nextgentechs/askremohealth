/**
 * Forgot Password Page
 *
 * Allows users to request a password reset link.
 * Implements rate limiting feedback and success messaging.
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Logo from '@web/components/logo'
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { ArrowLeft, CheckCircle, Loader, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError(null)

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message ?? 'An error occurred')
        return
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('An error occurred. Please try again.')
    }
  })

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      {/* Header */}
      <div className="fixed left-0 right-0 top-0 flex items-end justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <Logo href="/" />
        <Link href="/auth">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>

      <div className="flex w-full max-w-md flex-col gap-6">
        {isSubmitted ? (
          // Success state
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Check Your Email</h1>
              <p className="mt-2 text-muted-foreground">
                If an account exists for{' '}
                <span className="font-medium">{form.getValues('email')}</span>,
                you&apos;ll receive a password reset link shortly.
              </p>
            </div>
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>Didn&apos;t receive the email?</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-disc pl-4 text-sm">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and try again</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                Try Different Email
              </Button>
              <Link href="/auth">
                <Button>Return to Login</Button>
              </Link>
            </div>
          </div>
        ) : (
          // Form state
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Forgot Your Password?</h1>
              <p className="mt-2 text-muted-foreground">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  {...form.register('email')}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/auth" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
