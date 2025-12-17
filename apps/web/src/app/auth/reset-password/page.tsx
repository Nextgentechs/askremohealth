/**
 * Reset Password Page
 *
 * Allows users to set a new password using their reset token.
 * Validates token on load and provides feedback for expired tokens.
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Logo from '@web/components/logo'
import { Alert, AlertDescription } from '@web/components/ui/alert'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { CheckCircle, Eye, EyeOff, Loader, Lock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Password requirements matching server schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must include a lowercase letter')
      .regex(/[A-Z]/, 'Password must include an uppercase letter')
      .regex(/[^a-zA-Z0-9]/, 'Password must include a special character')
      .refine((val) => !/\s/.test(val), 'Password must not contain spaces'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidating(false)
        setError(
          'Reset token is missing. Please request a new password reset link.',
        )
        return
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const result = await response.json()

        setIsTokenValid(result.valid)
        if (!result.valid) {
          setError(result.message ?? 'Invalid or expired reset link')
        }
      } catch (err) {
        console.error('Token validation error:', err)
        setError('Failed to validate reset link')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError(null)

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message ?? 'Failed to reset password')
        return
      }

      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth')
      }, 3000)
    } catch (err) {
      console.error('Password reset error:', err)
      setError('An error occurred. Please try again.')
    }
  })

  // Password strength indicator
  const password = form.watch('password')
  const passwordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
    noSpaces: !/\s/.test(password),
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      {/* Header */}
      <div className="fixed left-0 right-0 top-0 flex items-end justify-between border-b border-b-border bg-background px-6 py-4 sm:px-12">
        <Logo href="/" />
      </div>

      <div className="flex w-full max-w-md flex-col gap-6">
        {isValidating ? (
          // Loading state
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p>Validating reset link...</p>
          </div>
        ) : isSuccess ? (
          // Success state
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Password Reset Successful!</h1>
              <p className="mt-2 text-muted-foreground">
                Your password has been updated. You can now sign in with your
                new password.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecting to login in 3 seconds...
            </p>
            <Link href="/auth">
              <Button>Sign In Now</Button>
            </Link>
          </div>
        ) : !isTokenValid ? (
          // Invalid token state
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-red-100 p-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Link Expired</h1>
              <p className="mt-2 text-muted-foreground">
                {error ?? 'This password reset link has expired or is invalid.'}
              </p>
            </div>
            <Link href="/auth/forgot-password">
              <Button>Request New Reset Link</Button>
            </Link>
          </div>
        ) : (
          // Form state
          <>
            <div className="text-center">
              <Lock className="mx-auto h-12 w-12 text-primary" />
              <h1 className="mt-4 text-2xl font-bold">Set New Password</h1>
              <p className="mt-2 text-muted-foreground">
                Create a strong password for your account
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    {...form.register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}

                {/* Password strength indicator */}
                <div className="mt-2 space-y-1 text-xs">
                  <p
                    className={
                      passwordChecks.length
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    }
                  >
                    {passwordChecks.length ? '✓' : '○'} At least 8 characters
                  </p>
                  <p
                    className={
                      passwordChecks.lowercase
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    }
                  >
                    {passwordChecks.lowercase ? '✓' : '○'} One lowercase letter
                  </p>
                  <p
                    className={
                      passwordChecks.uppercase
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    }
                  >
                    {passwordChecks.uppercase ? '✓' : '○'} One uppercase letter
                  </p>
                  <p
                    className={
                      passwordChecks.special
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    }
                  >
                    {passwordChecks.special ? '✓' : '○'} One special character
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    {...form.register('confirmPassword')}
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmPassword.message}
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
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
