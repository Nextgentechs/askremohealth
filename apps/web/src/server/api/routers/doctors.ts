import { patients as patientsTable } from '@web/server/db/schema'
import Appointments from '@web/server/services/appointments'
import { Doctors } from '@web/server/services/doctors'
import { users as usersTable } from '@web/server/db/schema'
import assert from 'assert'
import { db } from '@web/server/db'
import { eq, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { doctorProcedure, procedure, publicProcedure } from '../trpc'
import {
  availabilityDetailsSchema,
  doctorAppointmentListSchema,
  doctorListSchema,
  personalDetailsSchema,
  professionalDetailsSchema,
} from '../validators'

export const updatePersonalDetails = procedure
  .input(personalDetailsSchema)
  .mutation(async ({ input, ctx }) => {
    return Doctors.updatePersonalDetails(input, ctx.user.id ?? '')
  })

export const updateProfilePicture = doctorProcedure
  .input(z.object({ profilePicture: z.string() }))
  .mutation(async ({ input, ctx }) => {
    assert(ctx.user?.id, 'User not found')
    return Doctors.updateProfilePicture({
      userId: ctx.user.id,
      profilePicture: input.profilePicture,
    })
  })

export const updateProfessionalDetails = procedure
  .input(professionalDetailsSchema)
  .mutation(async ({ input, ctx }) => {
    return Doctors.updateProfessionalDetails(input, ctx.user.id ?? '')
  })

export const updateAvailabilityDetails = procedure
  .input(availabilityDetailsSchema)
  .mutation(async ({ input, ctx }) => {
    return Doctors.updateAvailabilityDetails(input, ctx.user.id ?? '')
  })

export const currentDoctor = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null
  const userId = ctx.user.id ?? ''
  const doctor = await db.query.doctors.findFirst({
    where: (doctor) => eq(doctor.id, userId),
    with: {
      profilePicture: true,
      specialty: true,
      facility: true,
      operatingHours: true,
      certificates: true,
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })
  return doctor ?? null
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
    return Appointments.upcoming(
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
    assert(ctx.user?.id, 'User not found')
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
    assert(ctx.user?.id, 'User not found')
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
      query: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }),
  )
  .query(async ({ ctx, input }) => {
    assert(ctx.user?.id, 'User not found')
    return Doctors.patients({
      query: input.query,
      doctorId: ctx.user.id,
      page: input.page,
      limit: input.limit,
    })
  })

export const searchPatient = doctorProcedure
  .input(z.object({ query: z.string() }))
  .query(async ({ ctx, input }) => {
    return ctx.db
      .select({
        id: patientsTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      })
      .from(patientsTable)
      .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
      .where(
        or(
          ilike(usersTable.firstName, `%${input.query}%`),
          ilike(usersTable.lastName, `%${input.query}%`),
        ),
      )
      .limit(6)
  })
