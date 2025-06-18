import { z } from 'zod'
import { procedure, publicProcedure } from '../trpc'
import { db } from '@web/server/db'
import { patients, users } from '@web/server/db/schema'
import { patientDetailsSchema } from '@web/server/api/validators'
import { eq } from 'drizzle-orm'

export const updatePatientDetails = procedure
  .input(patientDetailsSchema)
  .mutation(async ({ input, ctx }) => {
    // Update the user table
    await db.update(users)
      .set({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        onboardingComplete: true,
      })
      .where(eq(users.id, ctx.user.id))

    // Update the patient table
    await db.update(patients)
      .set({
        phone: input.phone,
        dob: new Date(input.dob),
        emergencyContact: input.emergencyContact,
      })
      .where(eq(patients.userId, ctx.user.id))

    return { success: true }
  })

export const patientsRouter = {
  updatePatientDetails,
}
