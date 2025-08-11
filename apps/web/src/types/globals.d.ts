export {}

// Create a type for the roles
export type Roles = 'user' | 'specialist' | 'admin'

// Lab test related types
export interface Test {
  id: string
  name: string
  specificCategory?: string
  generalCategory?: string
  sampleType?: string
  loincTestId?: string
  createdAt: Date
}

export interface LabTestAvailable {
  id: string
  labId: string
  testId: string
  amount: number
  collection: 'onsite' | 'home' | 'both'
  createdAt: Date
  updatedAt: Date
  test: Test
}

export interface Lab {
  placeId: string
  name: string
  address: string
  county: string
  town: string
  phone?: string
  website?: string
}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean
      role?: Roles
    }
  }
}
