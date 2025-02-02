import { doctorProcedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { Doctors } from '@web/server/services/doctors'
import {
  doctorAppointmentListSchema,
  doctorListSchema,
  doctorSignupSchema,
} from '../validation'
import { lucia } from '@web/lib/lucia'
import { cookies } from 'next/headers'
import Appointments from '@web/server/services/appointments'
import assert from 'assert'
import { eq } from 'drizzle-orm'

export const signup = publicProcedure
  .input(doctorSignupSchema)
  .mutation(async ({ input }) => {
    return Doctors.signup(input)
  })

export const login = publicProcedure
  .input(
    z.object({
      phone: z.string(),
      password: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return Doctors.login(input)
  })

export const currentDoctor = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null
  const doctor = await ctx.db.query.doctors.findFirst({
    where: (doctor) => eq(doctor.id, ctx.user!.id),
    with: {
      specialty: true,
      user: {
        with: {
          profilePicture: true,
        },
      },
      facility: true,
      operatingHours: true,
      certificates: true,
    },
  })
  return doctor ?? null
})

export const signOut = doctorProcedure.mutation(async ({ ctx }) => {
  if (ctx.session) await lucia.invalidateSession(ctx.session.id)
  const cookie = lucia.createBlankSessionCookie()
  const cookieStore = await cookies()
  cookieStore.set(cookie.name, cookie.value, cookie.attributes)
})

export const list = publicProcedure
  .input(doctorListSchema)
  .query(async ({ input }) => {
    return Doctors.list(input)
  })

export const details = publicProcedure
  .input(z.string())
  .query(async ({ input }) => {
    return Doctors.details(input)
  })

export const upcommingAppointments = doctorProcedure
  .input(
    z.object({
      type: z.enum(['physical', 'online']),
      page: z.number().optional().catch(1),
      pageSize: z.number().optional().catch(10),
    }),
  )
  .query(async ({ ctx, input }) => {
    assert(ctx.user?.id, 'User not found')
    return Appointments.upcomming(
      ctx.user.id,
      input.type,
      input.page ?? 1,
      input.pageSize ?? 10,
    )
  })

export const allAppointments = doctorProcedure
  .input(doctorAppointmentListSchema)
  .query(async ({ ctx, input }) => {
    assert(ctx.user?.id, 'User not found')
    return Appointments.list(ctx.user.id, input)
  })

export const appointmentDetails = doctorProcedure
  .input(z.object({ appointmentId: z.string() }))
  .query(async ({ input }) => {
    return Doctors.appointmentDetails(input.appointmentId)
  })

export const confirmAppointment = doctorProcedure
  .input(z.object({ appointmentId: z.string() }))
  .mutation(async ({ input }) => {
    return Doctors.confirmAppointment(input.appointmentId)
  })

export const declineAppointment = doctorProcedure
  .input(z.object({ appointmentId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return Doctors.declineAppointment(input.appointmentId, ctx.user.id)
  })

export const cancelAppointment = doctorProcedure
  .input(z.object({ appointmentId: z.string() }))
  .mutation(async ({ input }) => {
    return Doctors.cancelAppointment(input.appointmentId)
  })

export const postAppointment = doctorProcedure
  .input(
    z.object({
      appointmentId: z.string(),
      doctorNotes: z.string(),
      attachment: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    return Doctors.postAppointment(
      ctx.user.id,
      input.appointmentId,
      input.doctorNotes,
      input.attachment,
    )
  })

export const patients = doctorProcedure
  .input(
    z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
    }),
  )
  .query(async ({ ctx, input }) => {
    return Doctors.patients(ctx.user.id, input.page, input.limit)
  })
