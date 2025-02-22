import { TRPCError } from '@trpc/server'
import {
  type DoctorAppointmentListSchema,
  type NewAppointmentSchema,
} from '../api/validators'
import { db } from '../db'
import { appointments, patients, type users } from '../db/schema'
import { AppointmentStatus } from '../utils'
import { User } from './users'

import { and, count, eq, gte, lte, type InferSelectModel } from 'drizzle-orm'
export default class Appointments {
  static async createNewUserAppointment(input: NewAppointmentSchema) {
    const user = await User.createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      role: 'patient',
      dob: input.dob,
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Failed to create user',
      })
    }

    await db.insert(patients).values({
      id: user.id,
      lastAppointment: input.date,
    })

    await db.insert(appointments).values({
      doctorId: input.doctorId,
      patientId: user.id,
      appointmentDate: input.date,
      patientNotes: input.notes,
      type: input.appointmentType,
      status: AppointmentStatus.PENDING,
    })

    return { success: true }
  }

  static async createDoctorAppointment(
    user: InferSelectModel<typeof users>,
    date: Date,
    appointmentType: 'online' | 'physical',
    doctorId: string,
    notes?: string,
  ) {
    const patient = await db.query.patients.findFirst({
      where: (patient, { eq }) => eq(patient.id, user.id),
    })

    if (!patient) {
      await Promise.all([
        db.insert(patients).values({
          id: user.id,
          lastAppointment: date,
        }),
        db.insert(appointments).values({
          doctorId: doctorId,
          patientId: user.id,
          appointmentDate: date,
          patientNotes: notes,
          type: appointmentType,
          status: AppointmentStatus.PENDING,
        }),
      ])

      return { success: true }
    }

    await db.insert(appointments).values({
      doctorId: doctorId,
      patientId: user.id,
      appointmentDate: date,
      patientNotes: notes,
      type: appointmentType,
      status: AppointmentStatus.PENDING,
    })

    return { success: true }
  }

  static async upcomming(
    doctorId: string,
    type: 'physical' | 'online',
    page: number,
    pageSize: number,
  ) {
    const offset = (page - 1) * pageSize
    const limit = pageSize

    const countQuery = db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.type, type),
          gte(appointments.appointmentDate, new Date()),
        ),
      )

    const query = db.query.appointments.findMany({
      where: (appontment, { and, eq, gte }) =>
        and(
          eq(appontment.doctorId, doctorId),
          eq(appontment.type, type),
          gte(appontment.appointmentDate, new Date()),
        ),
      columns: {
        id: true,
        appointmentDate: true,
        status: true,
        patientNotes: true,
        type: true,
      },
      with: {
        patient: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: (appointments, { desc, sql }) => [
        sql`CASE 
          WHEN ${appointments.status} = 'pending' THEN 1
          WHEN ${appointments.status} = 'in_progress' THEN 2
          WHEN ${appointments.status} = 'scheduled' THEN 3
          WHEN ${appointments.status} = 'completed' THEN 4
          WHEN ${appointments.status} = 'missed' THEN 5
          WHEN ${appointments.status} = 'rescheduled' THEN 6
          WHEN ${appointments.status} = 'cancelled' THEN 7
          ELSE 8
        END`,
        desc(appointments.appointmentDate),
      ],
      offset,
      limit,
    })

    const [totalCount, data] = await Promise.all([countQuery, query])

    return {
      pagination: {
        total: totalCount[0]?.count ?? 0,
        pages: Math.ceil((totalCount[0]?.count ?? 0) / pageSize),
      },
      appointments: data,
    }
  }

  static async list(doctorId: string, input: DoctorAppointmentListSchema) {
    const offset = (input.page - 1) * input.pageSize
    const limit = input.pageSize

    const countQuery = db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.type, input.type),
          input.status ? eq(appointments.status, input.status) : undefined,
          input.patientId
            ? eq(appointments.patientId, input.patientId)
            : undefined,
          input.startDate
            ? gte(appointments.appointmentDate, new Date(input.startDate))
            : undefined,
          input.endDate
            ? lte(appointments.appointmentDate, new Date(input.endDate))
            : undefined,
        ),
      )

    const query = db.query.appointments.findMany({
      where: (appontment, { and, eq, gte, lte }) =>
        and(
          eq(appontment.doctorId, doctorId),
          eq(appontment.type, input.type),
          input.status ? eq(appontment.status, input.status) : undefined,
          input.patientId
            ? eq(appontment.patientId, input.patientId)
            : undefined,
          input.startDate
            ? gte(appontment.appointmentDate, new Date(input.startDate))
            : undefined,
          input.endDate
            ? lte(appontment.appointmentDate, new Date(input.endDate))
            : undefined,
        ),
      columns: {
        id: true,
        appointmentDate: true,
        status: true,
        patientNotes: true,
        type: true,
      },
      with: {
        doctor: {
          columns: {
            id: true,
          },
        },
        patient: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },

      offset,
      limit,
    })

    const [totalCount, data] = await Promise.all([countQuery, query])

    return {
      pagination: {
        total: totalCount[0]?.count ?? 0,
        pages: Math.ceil((totalCount[0]?.count ?? 0) / input.pageSize),
      },
      appointments: data,
    }
  }
}
