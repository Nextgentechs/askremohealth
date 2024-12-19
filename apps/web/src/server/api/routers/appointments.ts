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
  },
})
