import { TRPCError } from '@trpc/server'
import { and, count, eq } from 'drizzle-orm'
import {
  AppointmentStatus,
  type AppointmentListSchema,
} from '../api/validators'
import { db } from '../db'
import { appointmentLogs, appointments } from '../db/schema'

export class User {
  static async getUserAppointments(
    userId: string,
    input: AppointmentListSchema,
  ) {
    const offset = (input.page - 1) * input.limit

    const whereConditions = () =>
      and(
        eq(appointments.patientId, userId),
        input.type ? eq(appointments.type, input.type) : undefined,
        input.status ? eq(appointments.status, input.status) : undefined,
      )

    const [countResult, appointmentsList] = await Promise.all([
      db
        .select({ count: count() })
        .from(appointments)
        .where(whereConditions)
        .then((res) => Number(res[0]?.count)),
      db.query.appointments.findMany({
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
              firstName: true,
              lastName: true,
            },
            with: {
              profilePicture: true,
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
  }

  static async cancelAppointment(appointmentId: string, userId: string) {
    const appointment = await db.query.appointments.findFirst({
      where: (appointment, { eq, and, inArray, gte }) =>
        and(
          gte(appointment.appointmentDate, new Date()),
          eq(appointment.id, appointmentId),
          eq(appointment.patientId, userId),
          inArray(appointment.status, [
            AppointmentStatus.Scheduled,
            AppointmentStatus.Pending,
            AppointmentStatus.InProgress,
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
      db
        .update(appointments)
        .set({
          status: AppointmentStatus.Cancelled,
        })
        .where(eq(appointments.id, appointmentId)),
      db.insert(appointmentLogs).values({
        appointmentId: appointmentId,
        status: AppointmentStatus.Cancelled,
      }),
    ])

    return { success: true }
  }

  static async rescheduleAppointment(
    appointmentId: string,
    userId: string,
    newDate: Date,
  ) {
    const appointment = await db.query.appointments.findFirst({
      where: (appointment, { eq, and, inArray, gte }) =>
        and(
          gte(appointment.appointmentDate, new Date()),
          eq(appointment.id, appointmentId),
          eq(appointment.patientId, userId),
          inArray(appointment.status, [
            AppointmentStatus.Scheduled,
            AppointmentStatus.Pending,
            AppointmentStatus.InProgress,
          ]),
        ),
    })

    if (!appointment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Appointment not found',
      })
    }

    const newAppointment = await db
      .insert(appointments)
      .values({
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        appointmentDate: newDate,
        type: appointment.type,
        patientNotes: appointment.patientNotes,
        doctorNotes: appointment.doctorNotes,
        status: AppointmentStatus.Scheduled,
      })
      .returning()

    await Promise.all([
      db
        .update(appointments)
        .set({
          status: AppointmentStatus.Rescheduled,
        })
        .where(eq(appointments.id, appointmentId)),
      db.insert(appointmentLogs).values([
        {
          appointmentId: appointmentId,
          status: AppointmentStatus.Rescheduled,
        },
      ]),
    ])

    return { success: true, newAppointmentId: newAppointment[0]?.id }
  }
}
