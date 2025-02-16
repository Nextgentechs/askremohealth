import { count, and, eq, type InferInsertModel } from 'drizzle-orm'
import { appointmentLogs, appointments, users } from '../db/schema'
import { db } from '../db'
import { TRPCError } from '@trpc/server'
import { lucia } from '@web/lib/lucia'
import bcrypt from 'bcrypt'
import { type Context } from '../api/trpc'
import { cookies } from 'next/headers'
import {
  AppointmentStatus,
  type AppointmentListSchema,
} from '../api/validation'

export class User {
  static async createUser(params: InferInsertModel<typeof users>) {
    const [user] = await db
      .insert(users)
      .values({
        ...params,
      })
      .returning()

    if (!user) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Failed to create user',
      })
    }

    return user
  }

  static async updateProfile(
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    dob: Date,
  ) {
    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    await db
      .update(users)
      .set({
        firstName,
        lastName,
        email,
        phone,
        dob,
      })
      .where(eq(users.id, userId))

    return { success: true }
  }

  static async updatePassword(
    oldPassword: string,
    newPassword: string,
    ctx: Context,
  ) {
    const user = await db.query.users.findFirst({
      where: (user, { eq, and }) =>
        and(eq(user.id, ctx.user?.id ?? ''), eq(user.hasAccount, true)),
    })
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password!)
    if (!passwordMatch) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Old Password is incorrect',
      })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id))

    if (ctx.session) await lucia.invalidateSession(ctx.session ?? '')
    const cookie = lucia.createBlankSessionCookie()
    const cookieStore = await cookies()
    cookieStore.set(cookie.name, cookie.value, cookie.attributes)

    return { success: true }
  }

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

  static async signOut(ctx: Context) {
    if (ctx.session) await lucia.invalidateSession(ctx.session ?? '')
    const cookie = lucia.createBlankSessionCookie()
    const cookieStore = await cookies()
    cookieStore.set(cookie.name, cookie.value, cookie.attributes)
  }

  static async getUser(userId: string) {
    return await db.query.patients.findFirst({
      where: (patient) => eq(patient.id, userId),
      with: {
        user: true,
      },
    })
  }
}
