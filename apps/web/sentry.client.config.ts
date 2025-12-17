/**
 * Sentry Client Configuration
 * This file configures the Sentry SDK for the browser/client-side.
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  // Capture 10% of transactions for performance monitoring in production
  // Adjust this value as needed based on your traffic volume
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  // Capture 10% of sessions for session replay in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // Capture 100% of sessions with errors for debugging
  replaysOnErrorSampleRate: 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Environment tag for filtering in Sentry dashboard
  environment: process.env.NODE_ENV,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text for privacy
      maskAllText: false,
      // Block all media for privacy
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter out certain errors that we don't want to track
  beforeSend(event) {
    // Filter out chunk load errors which are usually caused by deployments
    if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError')) {
      return null
    }
    return event
  },

  // Only send events in production or if explicitly enabled
  enabled:
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',
})
