'use client'

/**
 * App-level Error Page
 *
 * Handles errors within the (app) route group.
 * Uses the shared error boundary component for consistency.
 */

import ErrorBoundary from '@web/components/error-boundary'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary error={error} reset={reset} />
}
