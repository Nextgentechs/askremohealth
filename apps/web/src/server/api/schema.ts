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

export const newAppointmentSchema = z.object({
  appointmentType: z.enum(['physical', 'online']),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string(),
  dob: z.string(),
  notes: z.string().optional(),
  date: z.date().refine((date) => date > new Date(), {
    message: 'Date must be in the future',
  }),
  doctorId: z.string(),
})
export type NewAppointmentSchema = z.infer<typeof newAppointmentSchema>
