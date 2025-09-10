import { type DefaultSession, type DefaultUser } from 'next-auth'
import { type JWT } from 'next-auth/jwt'
import { type InferSelectModel } from 'drizzle-orm'
import { labs, labTestsAvailable, tests } from '@web/server/db/schema'

export {}

type LabTest = InferSelectModel<typeof tests>
export type LabTestAvailable = InferSelectModel<typeof labTestsAvailable> & {
  test: LabTest
}

// Create a type for the roles
export type Roles = 'user' | 'doctor' | 'admin' | 'lab'

// Define the Lab type based on your schema
export type Lab = InferSelectModel<typeof labs>;

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean
      role?: Roles
      lab?: Lab
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role?: Roles
    lab?: Lab
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: Roles
    lab?: Lab
  }
}
