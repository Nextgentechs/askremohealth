import { currentUser as clerkCurrentUser } from '@clerk/nextjs/server'
import { db } from '@web/server/db'
import { appointmentLogs, appointments, patients } from '@web/server/db/schema'
import { User } from '@web/server/services/users'
import { AppointmentStatus } from '@web/server/utils'
import { z } from 'zod'
import { procedure, publicProcedure } from '../trpc'
import { appointmentListSchema, newAppointmentSchema } from '../validators'

export const currentUser = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null
  const clerkUser = await clerkCurrentUser()
  return clerkUser ?? null
})

export const createAppointment = procedure
  .input(newAppointmentSchema)
  .mutation(async ({ ctx, input }) => {
    const patient = await ctx.db.query.patients.findFirst({
      where: (patient, { eq }) => eq(patient.id, ctx.user?.id ?? ''),
    })
    if (!patient) {
      const currentUser = await clerkCurrentUser()
      await ctx.db.insert(patients).values({
        id: ctx.user?.id ?? '',
        firstName: currentUser?.firstName ?? '',
        lastName: currentUser?.lastName ?? '',
        email: input.email ?? currentUser?.emailAddresses[0]?.emailAddress,
        phone: input.phone,
        dob: input.dob,
        lastAppointment: input.date,
      })
    }

    const [appointment] = await db
      .insert(appointments)
      .values({
        doctorId: input.doctorId,
        patientId: ctx.user?.id ?? '',
        appointmentDate: input.date,
        patientNotes: input.notes,
        type: input.appointmentType,
        status: AppointmentStatus.PENDING,
      })
      .returning()
    await db.insert(appointmentLogs).values({
      appointmentId: appointment?.id ?? '',
      status: AppointmentStatus.PENDING,
    })

    return { success: true }
  })

export const listAppointments = procedure
  .input(appointmentListSchema)
  .query(async ({ ctx, input }) => {
    return await User.getUserAppointments(ctx.user.id ?? '', input)
  })

export const cancelAppointment = procedure
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    return User.cancelAppointment(input, ctx.user.id ?? '')
  })

export const rescheduleAppointment = procedure
  .input(
    z.object({
      appointmentId: z.string(),
      newDate: z.date(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return User.rescheduleAppointment(
      input.appointmentId,
      ctx.user.id ?? '',
      input.newDate,
    )
  })
