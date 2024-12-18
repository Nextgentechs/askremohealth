import { z } from 'zod'

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
  appointmentDuration: z.string(),
  operatingHours: z.array(operatingHoursSchema),
  medicalLicense: z.string().optional(),
  profilePicture: z.string().optional(),
})
