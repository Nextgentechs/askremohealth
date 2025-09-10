import { type DefaultSession, type DefaultUser } from 'next-auth'
import { type JWT } from 'next-auth/jwt'

export {}

// Create a type for the roles
export type Roles = 'user' | 'doctor' | 'admin' | 'lab'

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
