'use client'

/**
 * Global Error Page
 *
 * Next.js App Router error page component.
 * This file is automatically used by Next.js when an error occurs.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import ErrorBoundary from '@web/components/error-boundary'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <ErrorBoundary error={error} reset={reset} />
        </div>
      </body>
    </html>
  )
}
