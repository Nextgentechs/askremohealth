'use client'

/**
 * Global Error Boundary Component
 *
 * Catches unhandled errors in the application and displays a user-friendly
 * error page with options to retry or navigate home.
 *
 * This component is used by Next.js App Router's error handling system.
 *
 * @module components/error-boundary
 */

import { Button } from '@web/components/ui/button'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary component for handling runtime errors
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('Application Error:', error)

    // TODO: Send to error monitoring service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error)
    // }
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-muted-foreground max-w-md">
          We apologize for the inconvenience. An unexpected error occurred while
          processing your request.
        </p>
      </div>

      {/* Error details (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 max-w-lg rounded-lg border bg-muted/50 p-4 text-left text-sm">
          <summary className="cursor-pointer font-medium">
            Error Details (Development Only)
          </summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
            {error.message}
            {error.stack && (
              <>
                {'\n\n'}
                {error.stack}
              </>
            )}
          </pre>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </details>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        If this problem persists, please{' '}
        <Link
          href="/contact-us"
          className="underline underline-offset-4 hover:text-primary"
        >
          contact our support team
        </Link>
        .
      </p>
    </div>
  )
}

/**
 * Inline error display for smaller sections
 * Use this when you want to show an error without taking over the whole page
 */
export function InlineError({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">
        {message ?? 'Something went wrong. Please try again.'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  )
}
