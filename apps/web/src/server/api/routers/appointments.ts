import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { eq } from 'drizzle-orm'
import { DoctorAppointments } from '@web/server/services/doctor-appointments'
import { TRPCError } from '@trpc/server'
import { hash } from 'bcrypt'
import { patients } from '@web/server/db/schema'
import { AppointmentStatus, convertTo24Hour } from '@web/server/utils'
import { PatientAppointments } from '@web/server/services/patient-appointments'
import { User } from '@web/server/services/users'

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
        return await DoctorAppointments.upcomming(ctx.user!.id, input)
      }),

    listAll: publicProcedure
      .input(appointmentSchema)
      .query(async ({ ctx, input }) => {
        return await DoctorAppointments.list(ctx.user!.id, input)
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
      .input(
        z.object({
          appointmentType: z.enum(['physical', 'online']),
          firstName: z.string(),
          lastName: z.string(),
          phone: z.string(),
          email: z.string(),
          dob: z.string(),
          notes: z.string().optional(),
          time: z.string(),
          date: z.string(),
          password: z.string().optional(),
          doctorId: z.string(),
          facility: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.db.query.users.findFirst({
          where: (user, { eq }) => eq(user.phone, input.phone),
        })

        if (!user && !input.password) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Password is required',
          })
        }

        const appointmentDate = new Date(
          `${input.date}T${convertTo24Hour(input.time)}`,
        )

        if (!user && input.password) {
          const hashedPassword = await hash(input.password, 10)
          const user = await User.createUser({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            password: hashedPassword,
            role: 'patient',
            dob: new Date(input.dob),
          })

          if (!user) {
            throw new TRPCError({
              code: 'NOT_IMPLEMENTED',
              message: 'Failed to create user',
            })
          }

          await ctx.db.insert(patients).values({
            id: user.id,
            lastAppointment: appointmentDate,
          })

          await PatientAppointments.create({
            doctorId: input.doctorId,
            patientId: user.id,
            appointmentDate,
            notes: input.notes,
            type: input.appointmentType,
            status: AppointmentStatus.SCHEDULED,
          })

          return { success: true }
        }

        if (user?.role === 'doctor') {
          await ctx.db.insert(patients).values({
            id: user.id,
            lastAppointment: appointmentDate,
          })

          await PatientAppointments.create({
            doctorId: input.doctorId,
            patientId: user.id,
            appointmentDate,
            notes: input.notes,
            type: input.appointmentType,
            status: AppointmentStatus.SCHEDULED,
          })

          return { success: true }
        }

        await PatientAppointments.create({
          doctorId: input.doctorId,
          patientId: user!.id,
          appointmentDate,
          notes: input.notes,
          type: input.appointmentType,
          status: AppointmentStatus.SCHEDULED,
        })

        return { success: true }
      }),
  },
})
