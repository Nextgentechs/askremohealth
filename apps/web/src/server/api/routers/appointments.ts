import { z } from 'zod'
import {
  createTRPCRouter,
  doctorProcedure,
  procedure,
  publicProcedure,
} from '../trpc'
import { and, count, eq, inArray } from 'drizzle-orm'

import {
  appointmentAttachments,
  appointmentLogs,
  appointments,
} from '@web/server/db/schema'
import { AppointmentStatus } from '@web/server/utils'
import { newAppointmentSchema } from '../schema'
import { db } from '@web/server/db'
import Appointments from '@web/server/services/appointments'
import assert from 'assert'
import { TRPCError } from '@trpc/server'
import { put } from '@vercel/blob'

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
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
})
export type AppointmentInput = z.infer<typeof appointmentSchema>

export const appointmentsRouter = createTRPCRouter({
  doctor: {
    upcomming: publicProcedure
      .input(
        z.object({
          type: z.enum(['physical', 'online']),
          page: z.number().optional().catch(1),
          pageSize: z.number().optional().catch(10),
        }),
      )
      .query(async ({ ctx, input }) => {
        assert(ctx.user?.id, 'User not found')
        return await Appointments.upcomming(
          ctx.user.id,
          input.type,
          input.page ?? 1,
          input.pageSize ?? 10,
        )
      }),

    listAll: publicProcedure
      .input(appointmentSchema)
      .query(async ({ ctx, input }) => {
        assert(ctx.user?.id, 'User not found')
        return await Appointments.list(ctx.user.id, input)
      }),

    details: doctorProcedure
      .input(z.object({ appointmentId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await ctx.db.query.appointments.findFirst({
          where: (appointment, { and, eq }) =>
            eq(appointment.id, input.appointmentId),
          columns: {
            id: true,
            appointmentDate: true,
            status: true,
            patientNotes: true,
            doctorNotes: true,
            type: true,
            updatedAt: true,
          },
          with: {
            logs: true,
            attachments: true,
            doctor: {
              columns: {
                id: true,
              },
              with: {
                user: {
                  columns: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            patient: {
              columns: {
                id: true,
              },
              with: {
                user: {
                  columns: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        })
      }),

    confirmAppointment: doctorProcedure
      .input(z.object({ appointmentId: z.string() }))
      .mutation(async ({ input }) => {
        const updatedAppointment = await db
          .update(appointments)
          .set({ status: AppointmentStatus.SCHEDULED })
          .where(
            and(
              eq(appointments.id, input.appointmentId),
              inArray(appointments.status, [AppointmentStatus.PENDING]),
            ),
          )
          .returning()

        if (!updatedAppointment.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        await db.insert(appointmentLogs).values({
          appointmentId: updatedAppointment[0]?.id ?? '',
          status: AppointmentStatus.SCHEDULED,
        })

        return { success: true }
      }),

    declineAppointment: doctorProcedure
      .input(z.object({ appointmentId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const updatedAppointment = await db
          .update(appointments)
          .set({ status: AppointmentStatus.CANCELLED })
          .where(
            and(
              eq(appointments.id, input.appointmentId),
              eq(appointments.doctorId, ctx.user?.id ?? ''),
              inArray(appointments.status, [AppointmentStatus.PENDING]),
            ),
          )
          .returning()

        if (!updatedAppointment.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        await db.insert(appointmentLogs).values({
          appointmentId: updatedAppointment[0]?.id ?? '',
          status: AppointmentStatus.CANCELLED,
        })

        return { success: true }
      }),

    cancelAppointment: doctorProcedure
      .input(z.object({ appointmentId: z.string() }))
      .mutation(async ({ input }) => {
        const updatedAppointment = await db
          .update(appointments)
          .set({ status: AppointmentStatus.CANCELLED })
          .where(
            and(
              eq(appointments.id, input.appointmentId),
              inArray(appointments.status, [AppointmentStatus.SCHEDULED]),
            ),
          )
          .returning()

        if (!updatedAppointment.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        await db.insert(appointmentLogs).values({
          appointmentId: updatedAppointment[0]?.id ?? '',
          status: AppointmentStatus.CANCELLED,
        })

        return { success: true }
      }),

    postAppointment: doctorProcedure
      .input(
        z.object({
          appointmentId: z.string(),
          doctorNotes: z.string(),
          attachment: z.string().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const appointment = await db.query.appointments.findFirst({
          where: (appointment, { eq }) =>
            eq(appointment.id, input.appointmentId),
        })

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        if (input.attachment) {
          const buffer = Buffer.from(
            input.attachment.replace(/^data:application\/pdf;base64,/, ''),
            'base64',
          )

          const { url, pathname } = await put(
            `documents/${ctx.user?.id}/${'appointment-attachment'}`,
            buffer,
            {
              access: 'public',
              contentType: `application/pdf`,
            },
          )

          await Promise.all([
            db.insert(appointmentAttachments).values({
              appointmentId: appointment.id,
              url,
              path: pathname,
            }),
            db
              .update(appointments)
              .set({
                doctorNotes: input.doctorNotes,
              })
              .where(eq(appointments.id, appointment.id)),
          ])

          return { success: true }
        }

        await db
          .update(appointments)
          .set({
            doctorNotes: input.doctorNotes,
          })
          .where(eq(appointments.id, appointment.id))

        return { success: true }
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
          patientNotes: input.notes,
          type: input.appointmentType,
          status: AppointmentStatus.PENDING,
        })

        return { success: true }
      }),

    list: procedure
      .input(
        z.object({
          page: z.number().default(1),
          limit: z.number().default(10),
          type: z.enum(['physical', 'online']).optional(),
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
        const offset = (input.page - 1) * input.limit

        const whereConditions = () =>
          and(
            eq(appointments.patientId, ctx.user.id),
            input.type ? eq(appointments.type, input.type) : undefined,
            input.status ? eq(appointments.status, input.status) : undefined,
          )

        const [countResult, appointmentsList] = await Promise.all([
          ctx.db
            .select({ count: count() })
            .from(appointments)
            .where(whereConditions)
            .then((res) => Number(res[0]?.count)),
          ctx.db.query.appointments.findMany({
            where: whereConditions,
            columns: {
              id: true,
              appointmentDate: true,
              status: true,
              patientNotes: true,
              doctorNotes: true,
              type: true,
              updatedAt: true,
            },
            with: {
              doctor: {
                columns: {
                  id: true,
                  title: true,
                  consultationFee: true,
                },
                with: {
                  user: {
                    columns: {
                      firstName: true,
                      lastName: true,
                    },
                    with: {
                      profilePicture: true,
                    },
                  },
                  specialty: {
                    columns: {
                      name: true,
                    },
                  },
                  facility: {
                    columns: {
                      address: true,
                      type: true,
                      name: true,
                    },
                  },
                },
              },
            },
            limit: input.limit,
            offset,
            orderBy: (appointments, { desc }) => [
              desc(appointments.updatedAt),
              desc(appointments.appointmentDate),
            ],
          }),
        ])

        const totalCount = countResult

        return {
          appointments: appointmentsList,
          meta: {
            total: totalCount,
            page: input.page,
            limit: input.limit,
            pageCount: Math.ceil(totalCount / input.limit),
          },
        }
      }),

    cancel: publicProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        const appointment = await db.query.appointments.findFirst({
          where: (appointment, { eq, and, inArray, gte }) =>
            and(
              gte(appointment.appointmentDate, new Date()),
              eq(appointment.id, input),
              eq(appointment.patientId, ctx.user?.id ?? ''),
              inArray(appointment.status, [
                AppointmentStatus.SCHEDULED,
                AppointmentStatus.PENDING,
                AppointmentStatus.IN_PROGRESS,
              ]),
            ),
        })
        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        await Promise.all([
          ctx.db
            .update(appointments)
            .set({
              status: AppointmentStatus.CANCELLED,
            })
            .where(eq(appointments.id, input)),
          ctx.db.insert(appointmentLogs).values({
            appointmentId: input,
            status: AppointmentStatus.CANCELLED,
          }),
        ])

        return { success: true }
      }),

    reschedule: publicProcedure
      .input(
        z.object({
          appointmentId: z.string(),
          newDate: z.date(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const appointment = await db.query.appointments.findFirst({
          where: (appointment, { eq, and, inArray, gte }) =>
            and(
              gte(appointment.appointmentDate, new Date()),
              eq(appointment.id, input.appointmentId),
              eq(appointment.patientId, ctx.user?.id ?? ''),
              inArray(appointment.status, [
                AppointmentStatus.SCHEDULED,
                AppointmentStatus.PENDING,
                AppointmentStatus.IN_PROGRESS,
              ]),
            ),
        })

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        const newAppointment = await ctx.db
          .insert(appointments)
          .values({
            doctorId: appointment.doctorId,
            patientId: appointment.patientId,
            appointmentDate: new Date(input.newDate),
            type: appointment.type,
            patientNotes: appointment.patientNotes,
            doctorNotes: appointment.doctorNotes,
            status: AppointmentStatus.SCHEDULED,
          })
          .returning()

        await Promise.all([
          ctx.db
            .update(appointments)
            .set({
              status: AppointmentStatus.RESCHEDULED,
            })
            .where(eq(appointments.id, input.appointmentId)),
          ctx.db.insert(appointmentLogs).values([
            {
              appointmentId: input.appointmentId,
              status: AppointmentStatus.RESCHEDULED,
            },
          ]),
        ])

        return { success: true, newAppointmentId: newAppointment[0]?.id }
      }),
  },
})
