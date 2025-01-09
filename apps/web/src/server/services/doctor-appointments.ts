import { and, eq, gte } from 'drizzle-orm'
import { db } from '../db'
import { type AppointmentInput } from '../api/routers/appointments'

export class DoctorAppointments {
  static async upcomming(doctorId: string, type: 'physical' | 'online') {
    return await db.query.appointments.findMany({
      where: (appontment) =>
        and(
          eq(appontment.doctorId, doctorId),
          eq(appontment.type, type),
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
  }

  static async list(doctorId: string, input: AppointmentInput) {
    return await db.query.appointments.findMany({
      where: (appontment) =>
        and(
          eq(appontment.doctorId, doctorId),
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
  }
}
