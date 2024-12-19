import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { and, eq, gte } from 'drizzle-orm'

const appointmentsSchema = z.object({
  doctorId: z.string(),
  patientId: z.string().optional(),
  type: z.enum(['physical', 'online']),
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
