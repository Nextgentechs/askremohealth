import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Server-side environment variables schema
   * These are never exposed to the client
   */
  server: {
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    BLOB_READ_WRITE_TOKEN: z.string(),
    GOOGLE_MAPS_API_KEY: z.string(),
    CRON_SECRET: z.string(),
    TWILIO_API_KEY_SECRET: z.string(),
    TWILIO_AUTH_TOKEN: z.string(),
    TWILIO_ACCOUNT_SID: z.string(),
    TWILIO_API_KEY_SID: z.string(),
    CLERK_SECRET_KEY: z.string(),
    // SECURITY: Moved from client to server - API keys should never be exposed to the client
    RESEND_API_KEY: z.string(),
    FROM_EMAIL: z.string().default('info@askremohealth.com'),
    // Redis configuration for session management
    REDIS_URL: z.string().optional(),
    REDIS_TOKEN: z.string().optional(),
    // NextAuth secret for session encryption
    AUTH_SECRET: z.string().optional(),
  },

  /**
   * Client-side environment variables schema
   * Only variables prefixed with NEXT_PUBLIC_ are exposed to the client
   * SECURITY: Never put API keys or secrets here
   */
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string(),
    // SECURITY: Removed NEXT_PUBLIC_RESEND_API_KEY - moved to server-side
    NEXT_PUBLIC_FROM_EMAIL: z.string().optional(),
    // App URLs for client-side navigation
    NEXT_PUBLIC_APP_URL: z.string().optional(),
  },

  /**
   * Runtime environment variable mapping
   * SECURITY: Ensure API keys are only mapped to server-side variables
   */
  runtimeEnv: {
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,

    // Security
    JWT_SECRET: process.env.JWT_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,

    // External Services (Server-side only)
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,

    // Twilio (Server-side only)
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET,
    TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID,

    // Clerk (Auth provider)
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,

    // Email (Server-side only - SECURITY FIX)
    RESEND_API_KEY:
      process.env.RESEND_API_KEY ?? process.env.NEXT_PUBLIC_RESEND_API_KEY, // Fallback for migration
    FROM_EMAIL: process.env.FROM_EMAIL,
    NEXT_PUBLIC_FROM_EMAIL: process.env.NEXT_PUBLIC_FROM_EMAIL,

    // Redis (Server-side only)
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,

    // App URLs
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  /**
   * Run build or dev with SKIP_ENV_VALIDATION to skip env validation.
   * Useful for Docker builds and CI pipelines.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * SOME_VAR: z.string() and SOME_VAR='' will throw an error.
   */
  emptyStringAsUndefined: true,
})
