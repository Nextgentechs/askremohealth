/**
 * Sentry Server Configuration
 * This file configures the Sentry SDK for Node.js/server-side.
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring
  // Capture 10% of transactions for performance monitoring in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Environment tag for filtering in Sentry dashboard
  environment: process.env.NODE_ENV,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 0.1,

  // Filter out certain errors
  beforeSend(event) {
    // Filter out known harmless errors
    const errorMessage = event.exception?.values?.[0]?.value ?? ''

    // Filter out TRPC not found errors (404s)
    if (errorMessage.includes('NOT_FOUND')) {
      return null
    }

    // Filter out authentication errors (expected behavior)
    if (errorMessage.includes('UNAUTHORIZED')) {
      return null
    }

    return event
  },

  // Only send events in production or if explicitly enabled
  enabled:
    process.env.NODE_ENV === 'production' ||
    process.env.SENTRY_ENABLED === 'true',
})
