import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { eq } from 'drizzle-orm'

import { appointments } from '@web/server/db/schema'
import { AppointmentStatus } from '@web/server/utils'
import { newAppointmentSchema } from '../schema'
import { db } from '@web/server/db'
import Appointments from '@web/server/services/appointments'
import assert from 'assert'

const appointmentSchema = z.object({
  type: z.enum(['physical', 'online']),
  patientId: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  status: z
    .enum([
      'scheduled',
      'pending',
      'completed',
      'cancelled',
      'rescheduled',
      'missed',
      'in_progress',
    ])
    .optional(),
})
export type AppointmentInput = z.infer<typeof appointmentSchema>

export const appointmentsRouter = createTRPCRouter({
  doctor: {
    upcomming: publicProcedure
      .input(z.enum(['physical', 'online']))
      .query(async ({ ctx, input }) => {
        assert(ctx.user?.id, 'User not found')
        return await Appointments.upcomming(ctx.user.id, input)
      }),

    listAll: publicProcedure
      .input(appointmentSchema)
      .query(async ({ ctx, input }) => {
        assert(ctx.user?.id, 'User not found')
        return await Appointments.list(ctx.user.id, input)
      }),

    patients: publicProcedure
      .input(
        z.object({
          page: z.number().default(1),
          limit: z.number().default(10),
        }),
      )
      .query(async ({ ctx, input }) => {
        const offset = (input.page - 1) * input.limit
        const patients = await ctx.db.query.appointments.findMany({
          where: (appointment) => eq(appointment.doctorId, ctx.user!.id),
          columns: {
            patientId: true,
          },
          with: {
            patient: {
              columns: {
                lastAppointment: true,
              },
              with: {
                user: {
                  columns: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                    dob: true,
                  },
                },
              },
            },
          },
          limit: input.limit,
          offset,
        })
        return patients.map((patient) => ({
          name: `${patient.patient.user.firstName} ${patient.patient.user.lastName}`,
          lastAppointment: patient.patient.lastAppointment,
          phone: patient.patient.user.phone,
          email: patient.patient.user.email,
          dob: patient.patient.user.dob,
        }))
      }),
  },
  patients: {
    create: publicProcedure
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
          notes: input.notes,
          type: input.appointmentType,
          status: AppointmentStatus.SCHEDULED,
        })

        return { success: true }
      }),
  },
})
