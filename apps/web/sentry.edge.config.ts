/**
 * Sentry Edge Configuration
 * This file configures the Sentry SDK for Edge runtime (middleware, edge functions).
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

  // Only send events in production or if explicitly enabled
  enabled:
    process.env.NODE_ENV === 'production' ||
    process.env.SENTRY_ENABLED === 'true',
})
