import { z } from 'zod'

export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Rescheduled = 'rescheduled',
  Missed = 'missed',
  InProgress = 'in_progress',
}

// ============================================================================
// SHARED VALIDATION UTILITIES
// ============================================================================

/**
 * International phone number validation
 * Supports formats:
 * - E.164: +254712345678, +1234567890
 * - Local: 0712345678 (Kenya), with country code transformation
 * - Various international formats
 *
 * @param allowEmpty - Whether empty strings are valid (for optional fields)
 */
export const createPhoneSchema = (
  options: { allowEmpty?: boolean; defaultCountryCode?: string } = {},
) => {
  const { allowEmpty = false, defaultCountryCode = '254' } = options

  return z
    .string()
    .transform((val) => val.replace(/[\s\-\(\)]/g, '')) // Remove spaces, dashes, parentheses
    .refine(
      (val) => {
        if (allowEmpty && val === '') return true
        // E.164 format: + followed by 7-15 digits
        if (/^\+[1-9]\d{6,14}$/.test(val)) return true
        // International without +: 7-15 digits starting with country code
        if (/^[1-9]\d{6,14}$/.test(val)) return true
        // Local Kenya format: 07xx or 01xx (10 digits)
        if (/^0[17]\d{8}$/.test(val)) return true
        return false
      },
      {
        message:
          'Please enter a valid phone number (e.g., +254712345678 or 0712345678)',
      },
    )
    .transform((val) => {
      if (val === '') return val
      // Already has +, return as-is
      if (val.startsWith('+')) return val
      // Local Kenya format, add country code
      if (val.startsWith('0')) {
        return `+${defaultCountryCode}${val.slice(1)}`
      }
      // Already has country code without +
      return `+${val}`
    })
}

/**
 * Date of birth validation with sensible age limits
 *
 * @param minAge - Minimum age in years (default 0)
 * @param maxAge - Maximum age in years (default 120)
 */
export const createDobSchema = (
  options: { minAge?: number; maxAge?: number } = {},
) => {
  const { minAge = 0, maxAge = 120 } = options

  return z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      { message: 'Invalid date format' },
    )
    .refine(
      (val) => {
        const date = new Date(val)
        const today = new Date()
        return date <= today
      },
      { message: 'Date of birth cannot be in the future' },
    )
    .refine(
      (val) => {
        const date = new Date(val)
        const today = new Date()
        const ageInYears =
          (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        return ageInYears >= minAge
      },
      { message: `Must be at least ${minAge} years old` },
    )
    .refine(
      (val) => {
        const date = new Date(val)
        const today = new Date()
        const ageInYears =
          (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        return ageInYears <= maxAge
      },
      { message: `Age cannot exceed ${maxAge} years` },
    )
}

/**
 * Bio/description validation with character limit
 */
export const createBioSchema = (maxLength = 256) => {
  return z
    .string()
    .max(maxLength, { message: `Bio must be ${maxLength} characters or less` })
    .optional()
}

// Pre-configured schemas for common use cases
export const phoneSchema = createPhoneSchema()
export const optionalPhoneSchema = createPhoneSchema({ allowEmpty: true })
export const patientDobSchema = createDobSchema({ minAge: 0, maxAge: 120 })
export const doctorDobSchema = createDobSchema({ minAge: 21, maxAge: 100 }) // Doctors must be at least 21
export const bioSchema = createBioSchema(256)

export const operatingHoursSchema = z.object({
  day: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  opening: z.string(),
  closing: z.string(),
  isOpen: z.boolean(),
})

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/[a-z]/, { message: 'Password must include a lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must include an uppercase letter' })
  .regex(/[^a-zA-Z0-9]/, {
    message: 'Password must include a special character',
  })
  .refine((val) => !/\s/.test(val), {
    message: 'Password must not contain spaces',
  })

export type PasswordSchema = z.infer<typeof passwordSchema>

export const doctorSignupSchema = z.object({
  title: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  bio: z.string().optional(),
  dob: z.string(),
  specialty: z.string(),
  subSpecialty: z.array(z.string()),
  experience: z.string().transform((val) => parseInt(val)),
  facility: z.string(),
  registrationNumber: z.string(),
  appointmentDuration: z.string().transform((val) => parseInt(val)),
  operatingHours: z.array(operatingHoursSchema),
  medicalLicense: z.string().optional(),
  profilePicture: z.string().optional(),
  consultationFee: z.string().transform((val) => parseInt(val)),
  gender: z.enum(['male', 'female']).optional(),
})
export type DoctorSignupSchema = z.infer<typeof doctorSignupSchema>

export const newAppointmentSchema = z.object({
  appointmentType: z.enum(['physical', 'online']),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string(),
  dob: z.string().transform((str) => new Date(str)),
  notes: z.string().optional(),
  date: z.date().refine((date) => date > new Date(), {
    message: 'Date must be in the future',
  }),
  doctorId: z.string(),
})
export type NewAppointmentSchema = z.infer<typeof newAppointmentSchema>

export const doctorListSchema = z.object({
  specialty: z.string().optional(),
  subSpecialties: z.array(z.string()).optional(),
  experiences: z
    .array(
      z.object({
        min: z.number(),
        max: z.number().optional(),
      }),
    )
    .optional(),
  genders: z.array(z.enum(['male', 'female'])).optional(),
  entities: z.array(z.string()).optional(),
  query: z.string().optional(),
  county: z.string().optional(),
  town: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
})

export const doctorAppointmentListSchema = z.object({
  type: z.enum(['physical', 'online']),
  patientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z
    .enum([
      'scheduled',
      'pending',
      'completed',
      'cancelled',
      'rescheduled',
      'missed',
      'in_progress',
    ])
    .optional(),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(10),
})
export type DoctorAppointmentListSchema = z.infer<
  typeof doctorAppointmentListSchema
>

export const appointmentListSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  type: z.enum(['physical', 'online']).optional(),
  status: z
    .enum([
      AppointmentStatus.Scheduled,
      AppointmentStatus.Pending,
      AppointmentStatus.Completed,
      AppointmentStatus.Cancelled,
      AppointmentStatus.Rescheduled,
      AppointmentStatus.Missed,
      AppointmentStatus.InProgress,
    ])
    .optional(),
})
export type AppointmentListSchema = z.infer<typeof appointmentListSchema>

export const personalDetailsSchema = z.object({
  title: z.string().optional(),
  phone: phoneSchema,
  dob: doctorDobSchema,
  gender: z.enum(['male', 'female']).optional(),
  bio: bioSchema,
  profilePicture: z.string().optional(),
})
export type PersonalDetailsSchema = z.infer<typeof personalDetailsSchema>

export const professionalDetailsSchema = z
  .object({
    specialty: z.string(),
    subSpecialty: z.array(z.string()).optional().default([]),
    facility: z.string().optional(),
    officeLocation: z.string().optional(),
    experience: z.number(),
    registrationNumber: z.string(),
    medicalLicense: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasFacility = (data.facility ?? '').trim() !== ''
      const hasOfficeLocation = (data.officeLocation ?? '').trim() !== ''
      return hasFacility || hasOfficeLocation
    },
    {
      message: 'Either facility or office location must be provided',
      path: ['facility'],
    },
  )
export type ProfessionalDetailsSchema = z.infer<
  typeof professionalDetailsSchema
>

export const availabilityDetailsSchema = z.object({
  consultationFee: z.string().transform((val) => Number(val)),
  appointmentDuration: z.string().transform((val) => Number(val)),
  operatingHours: z.array(operatingHoursSchema),
})
export type AvailabilityDetailsSchema = z.infer<
  typeof availabilityDetailsSchema
>

export const articleListSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
})
export type ArticleListSchema = z.infer<typeof articleListSchema>

export const articleSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required.' })
    .max(100, { message: 'Title must be at most 100 characters long' }),
  content: z
    .string()
    .min(150, { message: 'Content must be at least 150 characters long' }),
})

export type ArticleSchema = z.infer<typeof articleSchema>

export const patientDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: phoneSchema,
  dob: patientDobSchema,
  emergencyContact: phoneSchema,
})
export type PatientDetails = z.infer<typeof patientDetailsSchema>

export const adminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: passwordSchema,
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  role: z.enum(['admin']).default('admin'),
  onboardingComplete: z.boolean().default(false),
  permissions: z.array(
    z.object({
      resource: z.string(),
      action: z.string(),
    })
  ).default([]),
});
export type AdminSchema = z.infer<typeof adminSchema>