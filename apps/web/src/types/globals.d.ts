export {}

// Create a type for the roles
export type Roles = 'user' | 'doctor' | 'admin' | 'lab'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean
      role?: Roles
    }
  }
}
