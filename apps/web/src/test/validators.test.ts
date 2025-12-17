/**
 * Validators Unit Tests
 *
 * Tests for Zod validation schemas used across the application.
 * These are critical for ensuring data integrity.
 */

import { describe, expect, it } from 'vitest'
import {
  AppointmentStatus,
  createDobSchema,
  createPhoneSchema,
} from '../server/api/validators'

describe('createPhoneSchema', () => {
  const phoneSchema = createPhoneSchema()

  describe('valid phone numbers', () => {
    it('should accept E.164 format with +', () => {
      const result = phoneSchema.safeParse('+254712345678')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('+254712345678')
      }
    })

    it('should accept local Kenya format starting with 07', () => {
      const result = phoneSchema.safeParse('0712345678')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('+254712345678')
      }
    })

    it('should accept local Kenya format starting with 01', () => {
      const result = phoneSchema.safeParse('0112345678')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('+254112345678')
      }
    })

    it('should remove spaces and format correctly', () => {
      const result = phoneSchema.safeParse('+254 712 345 678')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('+254712345678')
      }
    })

    it('should remove dashes and format correctly', () => {
      const result = phoneSchema.safeParse('+254-712-345-678')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('+254712345678')
      }
    })

    it('should accept international numbers', () => {
      const result = phoneSchema.safeParse('+12025551234')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('+12025551234')
      }
    })
  })

  describe('invalid phone numbers', () => {
    it('should reject empty string by default', () => {
      const result = phoneSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('should reject too short numbers', () => {
      const result = phoneSchema.safeParse('+12345')
      expect(result.success).toBe(false)
    })

    it('should reject letters', () => {
      const result = phoneSchema.safeParse('+254abc123456')
      expect(result.success).toBe(false)
    })

    it('should reject numbers starting with 0 (not 07 or 01)', () => {
      const result = phoneSchema.safeParse('0212345678')
      expect(result.success).toBe(false)
    })
  })

  describe('allowEmpty option', () => {
    const optionalPhoneSchema = createPhoneSchema({ allowEmpty: true })

    it('should accept empty string when allowEmpty is true', () => {
      const result = optionalPhoneSchema.safeParse('')
      expect(result.success).toBe(true)
    })
  })
})

describe('createDobSchema', () => {
  const dobSchema = createDobSchema()

  describe('valid dates', () => {
    it('should accept a valid past date', () => {
      const result = dobSchema.safeParse('1990-01-15')
      expect(result.success).toBe(true)
    })

    it('should accept today (for newborns)', () => {
      const today = new Date().toISOString().split('T')[0]
      const result = dobSchema.safeParse(today)
      expect(result.success).toBe(true)
    })
  })

  describe('invalid dates', () => {
    it('should reject future dates', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const result = dobSchema.safeParse(futureDate.toISOString().split('T')[0])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'cannot be in the future',
        )
      }
    })

    it('should reject empty string', () => {
      const result = dobSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('should reject invalid date format', () => {
      const result = dobSchema.safeParse('not-a-date')
      expect(result.success).toBe(false)
    })
  })

  describe('age restrictions', () => {
    const adultSchema = createDobSchema({ minAge: 18 })

    it('should reject age below minimum', () => {
      const fiveYearsAgo = new Date()
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
      const result = adultSchema.safeParse(
        fiveYearsAgo.toISOString().split('T')[0],
      )
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'at least 18 years old',
        )
      }
    })

    it('should accept age above minimum', () => {
      const thirtyYearsAgo = new Date()
      thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30)
      const result = adultSchema.safeParse(
        thirtyYearsAgo.toISOString().split('T')[0],
      )
      expect(result.success).toBe(true)
    })
  })
})

describe('AppointmentStatus enum', () => {
  it('should have all expected status values', () => {
    expect(AppointmentStatus.Scheduled).toBe('scheduled')
    expect(AppointmentStatus.Pending).toBe('pending')
    expect(AppointmentStatus.Completed).toBe('completed')
    expect(AppointmentStatus.Cancelled).toBe('cancelled')
    expect(AppointmentStatus.Rescheduled).toBe('rescheduled')
    expect(AppointmentStatus.Missed).toBe('missed')
    expect(AppointmentStatus.InProgress).toBe('in_progress')
  })

  it('should have exactly 7 status values', () => {
    const statusValues = Object.values(AppointmentStatus)
    expect(statusValues).toHaveLength(7)
  })
})
