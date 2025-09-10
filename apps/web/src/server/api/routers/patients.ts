import { z } from 'zod'
import { protectedProcedure, publicProcedure } from '../trpc'
import { db } from '@web/server/db'
import { patients, users } from '@web/server/db/schema'
import { patientDetailsSchema } from '@web/server/api/validators'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const updatePatientDetails = protectedProcedure
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

export const getCurrentPatient = protectedProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null;
  const patient = await db.query.patients.findFirst({
    where: (patient, { eq }) => eq(patient.userId, ctx.user.id),
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  if (!patient) return null;
  const result = {
    firstName: patient.user?.firstName ?? '',
    lastName: patient.user?.lastName ?? '',
    email: patient.user?.email ?? '',
    phone: patient.phone ?? '',
    dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
    emergencyContact: patient.emergencyContact ?? '',
  };
  return result;
});

// Search patients by name (first or last, case-insensitive)
export const searchPatients = protectedProcedure.input(z.object({ query: z.string().min(1) })).query(async ({ input, ctx }) => {
  const q = `%${input.query.toLowerCase()}%`;
  const results = await db
    .select({
      id: patients.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: patients.phone,
      dob: patients.dob,
    })
    .from(patients)
    .innerJoin(users, eq(patients.userId, users.id))
    .where(
      sql`LOWER(${users.firstName}) LIKE ${q} OR LOWER(${users.lastName}) LIKE ${q}`
    );
  return results;
});

export const patientsRouter = {
  updatePatientDetails,
  getCurrentPatient,
  searchPatients,
}
