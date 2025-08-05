import { db } from '@web/server/db'
import { appointmentLogs, appointments, patients, doctors } from '@web/server/db/schema'
import { User } from '@web/server/services/users'
import { AppointmentStatus } from '@web/server/utils'
import { z } from 'zod'
import { protectedProcedure, publicProcedure } from '../trpc'
import { appointmentListSchema, newAppointmentSchema } from '../validators'

export const currentUser = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) {
    return null
  }

  // Get additional details based on role
  if (ctx.user.role === 'doctor') {
    const doctorDetails = await db.query.doctors.findFirst({
      where: (doctor, { eq }) => eq(doctor.userId, ctx.user?.id ?? ''),
      columns: {
        phone: true
      }
    })
    return { ...ctx.user, phone: doctorDetails?.phone }
  } else if (ctx.user.role === 'patient') {
    const patientDetails = await db.query.patients.findFirst({
      where: (patient, { eq }) => eq(patient.userId, ctx.user?.id ?? ''),
      columns: {
        phone: true
      }
    })
    return { ...ctx.user, phone: patientDetails?.phone }
  }

  return ctx.user
})

export const createAppointment = protectedProcedure
  .input(newAppointmentSchema)
  .mutation(async ({ ctx, input }) => {
    const patient = await db.query.patients.findFirst({
      where: (patient, { eq }) => eq(patient.id, ctx.user?.id ?? ''),
    })
    if (!patient) {
      await db.insert(patients).values({
        id: ctx.user?.id ?? '',
        userId: ctx.user?.id ?? '',
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

export const listAppointments = protectedProcedure
  .input(appointmentListSchema)
  .query(async ({ ctx, input }) => {
    return await User.getUserAppointments(ctx.user.id ?? '', input)
  })

export const cancelAppointment = protectedProcedure
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    return User.cancelAppointment(input, ctx.user.id ?? '')
  })

export const rescheduleAppointment = protectedProcedure
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
