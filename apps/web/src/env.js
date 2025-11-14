import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    BLOB_READ_WRITE_TOKEN: z.string(),
    GOOGLE_MAPS_API_KEY: z.string(),
    CRON_SECRET: z.string(),
    TWILIO_API_KEY_SECRET: z.string(),
    TWILIO_AUTH_TOKEN: z.string(),
    TWILIO_ACCOUNT_SID: z.string(),
    TWILIO_API_KEY_SID: z.string(),
    CLERK_SECRET_KEY: z.string(),

    // Make optional envs always valid strings
    AUTH_GOOGLE_ID: z.string().default(""),
    AUTH_GOOGLE_SECRET: z.string().default(""),

    OBJECT_STORAGE_ENDPOINT: z.string().default(""),
    OBJECT_STORAGE_REGION: z.string().default(""),
    OBJECT_STORAGE_BUCKET: z.string().default(""),
    OBJECT_STORAGE_KEY: z.string().default(""),
    OBJECT_STORAGE_SECRET: z.string().default(""),

    REDIS_URL: z.string().default(""),
    REDIS_TOKEN: z.string().default(""),
  },

  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string(),
    NEXT_PUBLIC_RESEND_API_KEY: z.string(),
    NEXT_PUBLIC_FROM_EMAIL: z.string(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || '',
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || '',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
    CRON_SECRET: process.env.CRON_SECRET || '',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET || '',
    TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID || '',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',

    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || '',
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || '',

    OBJECT_STORAGE_ENDPOINT: process.env.OBJECT_STORAGE_ENDPOINT || '',
    OBJECT_STORAGE_REGION: process.env.OBJECT_STORAGE_REGION || '',
    OBJECT_STORAGE_BUCKET: process.env.OBJECT_STORAGE_BUCKET || '',
    OBJECT_STORAGE_KEY: process.env.OBJECT_STORAGE_KEY || '',
    OBJECT_STORAGE_SECRET: process.env.OBJECT_STORAGE_SECRET || '',

    REDIS_URL: process.env.REDIS_URL || '',
    REDIS_TOKEN: process.env.REDIS_TOKEN || '',

    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '',
    NEXT_PUBLIC_RESEND_API_KEY: process.env.NEXT_PUBLIC_RESEND_API_KEY || '',
    NEXT_PUBLIC_FROM_EMAIL: process.env.NEXT_PUBLIC_FROM_EMAIL || '',
  },

  // Must be false or empty strings will break AWS
  emptyStringAsUndefined: false,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
