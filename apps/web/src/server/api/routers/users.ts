import { procedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { User } from '@web/server/services/users'
import { appointments } from '@web/server/db/schema'
import { AppointmentStatus } from '@web/server/utils'
import Appointments from '@web/server/services/appointments'
import { db } from '@web/server/db'
import { appointmentListSchema, newAppointmentSchema } from '../validation'
import { currentUser as clerkCurrentUser } from '@clerk/nextjs/server'

export const signOut = procedure.mutation(async ({ ctx }) => {
  return await User.signOut(ctx)
})

export const currentUser = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null
  const clerkUser = await clerkCurrentUser()
  return clerkUser ?? null
})

export const details = procedure
  .input(z.string().optional())
  .query(async ({ input }) => {
    if (!input) return null
    return await User.getUser(input)
  })

export const createAppointment = publicProcedure
  .input(newAppointmentSchema)
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (user, { eq }) => eq(user.phone, input.phone),
    })
    if (!user) {
      await Appointments.createNewUserAppointment(input)
      return
    }
    if (user.role === 'doctor') {
      await Appointments.createDoctorAppointment(
        user,
        input.date,
        input.appointmentType,
        input.doctorId,
        input.notes,
      )
      return
    }
    await db.insert(appointments).values({
      doctorId: input.doctorId,
      patientId: user.id,
      appointmentDate: input.date,
      patientNotes: input.notes,
      type: input.appointmentType,
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
