import { type DefaultSession, type DefaultUser } from 'next-auth'
import { type JWT } from 'next-auth/jwt'

export {}

// Create a type for the roles
export type Roles = 'doctor' | 'patient' | 'lab' | 'admin'

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

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string
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
