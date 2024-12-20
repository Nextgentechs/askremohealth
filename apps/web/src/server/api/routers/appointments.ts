import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { and, eq, gte } from 'drizzle-orm'

export const appointmentsRouter = createTRPCRouter({
  doctor: {
    upcomming: publicProcedure
      .input(z.enum(['physical', 'online']))
      .query(async ({ ctx, input }) => {
        return await ctx.db.query.appointments.findMany({
          where: (appontment) =>
            and(
              ctx.user?.id ? eq(appontment.doctorId, ctx.user.id) : undefined,
              eq(appontment.type, input),
              gte(appontment.appointmentDate, new Date()),
            ),
          columns: {
            id: true,
            appointmentDate: true,
            status: true,
            notes: true,
          },
          with: {
            patient: {
              with: {
                user: {
                  columns: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        })
      }),

    listAll: publicProcedure
      .input(
        z.object({
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
        }),
      )
      .query(async ({ ctx, input }) => {
        return await ctx.db.query.appointments.findMany({
          where: (appontment) =>
            and(
              ctx.user?.id ? eq(appontment.doctorId, ctx.user.id) : undefined,
              eq(appontment.type, input.type),
              input.status ? eq(appontment.status, input.status) : undefined,
              input.patientId
                ? eq(appontment.patientId, input.patientId)
                : undefined,
              gte(appontment.appointmentDate, input.startDate),
              gte(appontment.appointmentDate, input.endDate),
            ),
          columns: {
            id: true,
            appointmentDate: true,
            status: true,
            notes: true,
          },
          with: {
            doctor: {
              columns: {
                id: true,
              },
            },
            patient: {
              with: {
                user: {
                  columns: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        })
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
})
