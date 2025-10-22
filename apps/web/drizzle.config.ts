import { type Config } from 'drizzle-kit'

import { env } from 'src/env'

export default {
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL  + '?sslmode=require',
    ssl: {
      rejectUnauthorized: false, // Neon uses self-signed certs
    },
  },
} satisfies Config

