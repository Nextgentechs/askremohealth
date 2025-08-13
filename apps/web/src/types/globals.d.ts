export {}

// Create a type for the roles
export type Roles = 'user' | 'specialist' | 'admin'

// Lab test related types
export interface Test {
  id: string
  name: string
  specificCategory?: string | null
  generalCategory?: string | null
  sampleType?: string | null
  loincTestId?: string | null
  createdAt: Date
}

export interface LabTestAvailable {
  id: string
  labId: string
  testId: string
  amount: number
  collection: 'onsite' | 'home' | 'both'
  createdAt: Date
  updatedAt: Date | null
  test: Test
}

export interface Lab {
  placeId: string
  name: string
  address: string
  county: string
  town: string
  phone?: string | null
  website?: string | null
}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean
      role?: Roles
    }
  }
}
