export {}

// Create a type for the roles
export type Roles = 'user' | 'specialist' | 'admin'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean
      role?: Roles
    }
  }
}
