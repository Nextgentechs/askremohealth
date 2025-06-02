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
  .regex(/[^a-zA-Z0-9]/, { message: 'Password must include a special character' })
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
  // firstName: z.string(),
  // lastName: z.string(),
  // email: z.string().email().optional(),
  phone: z.string(),
  dob: z.string(),
  gender: z.enum(['male', 'female']).optional(),
  bio: z.string().optional(),
  profilePicture: z.string().optional(),
})
export type PersonalDetailsSchema = z.infer<typeof personalDetailsSchema>

export const professionalDetailsSchema = z.object({
  specialty: z.string(),
  subSpecialty: z.array(z.string()),
  facility: z.string().optional(),
  officeLocation: z.string().optional(),
  experience: z.number(),
  registrationNumber: z.string(),
  medicalLicense: z.string().optional(),
}).refine(
  (data) => data.facility ?? data.officeLocation,
  {
    message: "Either facility or office location must be provided",
    path: ["facility"],
  }
);
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
