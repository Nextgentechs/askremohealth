import { type Config } from 'drizzle-kit'

import { env } from 'src/env'

export default {
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // required for Neon
    },
  },
} satisfies Config

