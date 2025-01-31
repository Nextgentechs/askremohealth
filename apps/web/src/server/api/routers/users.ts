import { eq } from 'drizzle-orm'
import { procedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { User } from '@web/server/services/users'
import { appointments, patients, users } from '@web/server/db/schema'
import { AppointmentStatus } from '@web/server/utils'
import bcrypt from 'bcrypt'
import Appointments from '@web/server/services/appointments'
import { db } from '@web/server/db'
import { appointmentListSchema, newAppointmentSchema } from '../validation'

//TODO:THIS ROUTE SHOULD BE RESTRUCTURED
export const signup = publicProcedure
  .input(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      phone: z.string(),
      dob: z.string(),
      password: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const hashedPassword = await bcrypt.hash(input.password, 10)
    const user = await ctx.db.query.users.findFirst({
      where: (user) => eq(user.phone, input.phone),
    })

    if (user && !user.hasAccount) {
      await ctx.db
        .update(users)
        .set({
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          email: input.email,
          password: hashedPassword,
          dob: new Date(input.dob),
          hasAccount: true,
        })
        .where(eq(users.id, user.id))

      return { success: true }
    }

    const newUser = await User.createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      dob: new Date(input.dob),
      role: 'patient',
      hasAccount: true,
    })

    await ctx.db.insert(patients).values({
      id: newUser.id,
    })

    return { success: true }
  })

export const validatePhone = publicProcedure
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (user, { eq, and }) => and(eq(user.phone, input)),
    })
    if (!user) {
      return { success: false }
    }
    return { success: true, user }
  })

export const signOut = procedure.mutation(async ({ ctx }) => {
  return await User.signOut(ctx)
})

export const currentUser = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null
  const user = await ctx.db.query.users.findFirst({
    where: (user) => eq(user.id, ctx.user!.id),
  })
  return user ?? null
})

export const details = procedure
  .input(z.string().optional())
  .query(async ({ input }) => {
    if (!input) return null
    return await User.getUser(input)
  })

export const updateProfile = procedure
  .input(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      phone: z.string(),
      dob: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return User.updateProfile(
      ctx.user.id,
      input.firstName,
      input.lastName,
      input.email,
      input.phone,
      new Date(input.dob),
    )
  })

export const updatePassword = procedure
  .input(
    z.object({
      oldPassword: z.string(),
      newPassword: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return User.updatePassword(input.oldPassword, input.newPassword, ctx)
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
    return await User.getUserAppointments(ctx.user.id, input)
  })

export const cancelAppointment = procedure
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    return User.cancelAppointment(input, ctx.user.id)
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
      ctx.user.id,
      input.newDate,
    )
  })
