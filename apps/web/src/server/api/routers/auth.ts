import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { certificates, doctors, users } from '@web/server/db/schema'
import bcrypt from 'bcrypt'
import { TRPCError } from '@trpc/server'
import { put } from '@vercel/blob'

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
  from: z.string(),
  to: z.string(),
  isOpen: z.boolean(),
})

export const authRouter = createTRPCRouter({
  /**Doctor's Auth */

  signup: publicProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email().optional(),
        phone: z.string(),
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
        bio: z.string().optional(),
        dob: z.string(),
        specialty: z.string(),
        subSpecialty: z.array(z.object({ id: z.string(), name: z.string() })),
        experience: z.string().transform((val) => parseInt(val)),
        facility: z.string(),
        registrionNumber: z.string(),
        appointmentDuration: z.string(),
        operatingHours: z.array(operatingHoursSchema),
        medicalLicense: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
          subSpecialties: input.subSpecialty,
          experience: input.experience,
          facility: input.facility,
          licenseNumber: input.registrionNumber,
        })

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
      })

      return { success: true }
    }),
})
