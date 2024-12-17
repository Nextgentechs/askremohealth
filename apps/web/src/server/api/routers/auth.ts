import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  certificates,
  doctors,
  operatingHours,
  users,
} from '@web/server/db/schema'
import bcrypt from 'bcrypt'
import { TRPCError } from '@trpc/server'
import { put } from '@vercel/blob'
import { eq } from 'drizzle-orm'

const operatingHoursSchema = z.object({
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

const signupSchema = z.object({
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
})

export const authRouter = createTRPCRouter({
  /**Doctor's Auth */

  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (user) => eq(user.phone, input.phone),
      })

      if (user) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        })
      }
      await ctx.db.transaction(async (trx) => {
        const hashedPassword = await bcrypt.hash(input.password, 10)

        const [user] = await trx
          .insert(users)
          .values({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            password: hashedPassword,
            role: 'doctor',
            dob: new Date(input.dob),
          })
          .returning()

        if (!user) {
          throw new TRPCError({
            code: 'NOT_IMPLEMENTED',
            message: 'Failed to create user',
          })
        }

        await trx.insert(doctors).values({
          id: user.id,
          bio: input.bio,
          specialty: input.specialty,
          subSpecialties: input.subSpecialty.map((id) => ({ id })),
          experience: input.experience,
          facility: input.facility,
          licenseNumber: input.registrationNumber,
        })

        await trx.insert(operatingHours).values({
          doctorId: user.id,
          schedule: input.operatingHours,
        })

        if (input.medicalLicense) {
          const buffer = Buffer.from(
            input.medicalLicense.replace(/^data:application\/pdf;base64,/, ''),
            'base64',
          )

          const { url, pathname } = await put(
            `documents/${user.id}/${'medical-license'}`,
            buffer,
            {
              access: 'public',
              contentType: `application/pdf`,
            },
          )

          await trx.insert(certificates).values({
            doctorId: user.id,
            name: pathname,
            url,
          })
        }
      })

      return { success: true }
    }),
})
