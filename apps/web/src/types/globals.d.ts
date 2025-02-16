export {}

// Create a type for the roles
export type Roles = 'user' | 'doctor' | 'admin'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}
