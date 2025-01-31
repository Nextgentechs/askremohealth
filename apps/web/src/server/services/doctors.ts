import {
  appointmentAttachments,
  appointmentLogs,
  appointments,
  certificates,
  doctors,
  doctors as doctorsTable,
  facilities,
  operatingHours,
  profilePictures,
  users,
} from '@web/server/db/schema'
import {
  count,
  inArray,
  gte,
  sql,
  eq,
  or,
  between,
  and,
  exists,
} from 'drizzle-orm'
import { db } from '@web/server/db'
import { KENYA_COUNTIES } from '../data/kenya-counties'
import { type DoctorSignupSchema } from '../api/validation'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { Facility } from './facilities'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { lucia } from '@web/lib/lucia'
import { cookies } from 'next/headers'
import { AppointmentStatus } from '../utils'

type FilterInput = {
  specialty?: string
  subSpecialties?: string[]
  experiences?: Array<{ min: number; max?: number }>
  genders?: Array<'male' | 'female'>
  entities?: string[]
  query?: string
  county?: string
  town?: string
}

export class Doctors {
  static async signup(input: DoctorSignupSchema) {
    const user = await db.query.users.findFirst({
      where: (user) => eq(user.phone, input.phone),
    })
    if (user) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User already exists',
      })
    }

    await db.transaction(async (trx) => {
      const hashedPassword = await bcrypt.hash(input.password, 10)

      const [user] = await trx
        .insert(users)
        .values({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          password: hashedPassword,
          role: 'doctor',
          dob: new Date(input.dob),
        })
        .returning()

      if (!user) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Failed to create user',
        })
      }

      const facility = await Facility.register(input.facility)

      await trx.insert(doctors).values({
        id: user.id,
        bio: input.bio,
        specialty: input.specialty,
        subSpecialties: input.subSpecialty.map((id) => ({ id })),
        experience: input.experience,
        facility: facility?.placeId,
        licenseNumber: input.registrationNumber,
        gender: input.gender,
        title: input.title,
        consultationFee: input.consultationFee,
      })

      await trx.insert(operatingHours).values({
        doctorId: user.id,
        schedule: input.operatingHours,
        consultationDuration: input.appointmentDuration,
      })

      if (input.medicalLicense) {
        const buffer = Buffer.from(
          input.medicalLicense.replace(/^data:application\/pdf;base64,/, ''),
          'base64',
        )

        const { url, pathname } = await put(
          `documents/${user.id}/${'medical-license'}`,
          buffer,
          {
            access: 'public',
            contentType: `application/pdf`,
          },
        )

        await trx.insert(certificates).values({
          doctorId: user.id,
          name: pathname,
          url,
        })
      }

      if (input.profilePicture) {
        const base64Data = input.profilePicture.replace(
          /^data:image\/\w+;base64,/,
          '',
        )
        const buffer = await sharp(Buffer.from(base64Data, 'base64'))
          .resize(400, 400, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 80 })
          .toBuffer()

        const fileName = `profile-picture-${user.id}.webp`

        const { url, pathname } = await put(fileName, buffer, {
          access: 'public',
          contentType: `image/webp`,
        })

        await trx.insert(profilePictures).values({
          id: user.id,
          url,
          path: pathname,
        })
      }
    })

    return { success: true }
  }

  static async login(input: { phone: string; password: string }) {
    const user = await db.query.users.findFirst({
      where: (user) => eq(user.phone, input.phone),
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password!)

    if (!passwordMatch) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid password',
      })
    }

    const session = await lucia.createSession(user.id, {})
    const cookie = lucia.createSessionCookie(session.id)
    const cookieStore = await cookies()
    cookieStore.set(cookie.name, cookie.value, cookie.attributes)

    return { success: true }
  }

  static async getUpcomingAppointments(doctorIds: string[]) {
    const today = new Date()
    return db.query.appointments.findMany({
      where: (appointment, { and, gte, inArray }) =>
        and(
          inArray(appointment.doctorId, doctorIds),
          gte(appointment.appointmentDate, today),
          inArray(appointment.status, ['scheduled', 'in_progress', 'pending']),
        ),
      columns: {
        doctorId: true,
        appointmentDate: true,
      },
    })
  }

  static async getDoctorRatings(doctorIds: string[]) {
    return db.query.appointments.findMany({
      where: (appointment, { inArray }) =>
        inArray(appointment.doctorId, doctorIds),
      with: {
        review: {
          columns: {
            rating: true,
          },
        },
      },
      columns: {
        doctorId: true,
      },
    })
  }

  static buildWhereConditions(input: FilterInput) {
    const conditions = []
    if (input.specialty) {
      conditions.push(eq(doctorsTable.specialty, input.specialty))
    }
    if (input.subSpecialties?.length) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements(${doctorsTable.subSpecialties}) elem
          WHERE elem->>'id' IN (${input.subSpecialties
            .map((id) => sql`${id}`)
            .reduce((acc, curr, idx) =>
              idx === 0 ? curr : sql`${acc}, ${curr}`,
            )})
        )`,
      )
    }
    if (input.experiences?.length) {
      conditions.push(
        or(
          ...input.experiences.map((range) =>
            range.max
              ? between(doctorsTable.experience, range.min, range.max)
              : gte(doctorsTable.experience, range.min),
          ),
        ),
      )
    }
    if (input.genders?.length) {
      conditions.push(inArray(doctorsTable.gender, input.genders))
    }
    if (input.county || input.town) {
      const query = db
        .select()
        .from(facilities)
        .where(
          and(
            input.county
              ? eq(
                  facilities.county,
                  KENYA_COUNTIES.find((c) => c.code === input.county)?.name ??
                    '',
                )
              : undefined,
            input.town ? eq(facilities.town, input.town) : undefined,
          ),
        )

      conditions.push(exists(query))
    }

    return conditions.length ? and(...conditions) : undefined
  }

  //TODO:Consider optimizing this
  static async list(input: FilterInput & { page: number; limit: number }) {
    const { page, limit } = input
    const offset = (page - 1) * limit

    const countQuery = db
      .select({ count: count() })
      .from(doctorsTable)
      .where(this.buildWhereConditions(input))

    const doctorsQuery = db.query.doctors.findMany({
      where: this.buildWhereConditions(input),
      limit,
      offset,
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
          with: {
            profilePicture: true,
          },
        },
        facility: {
          columns: {
            placeId: true,
            name: true,
            address: true,
            town: true,
            county: true,
          },
        },
        specialty: true,
        operatingHours: true,
      },
    })

    const [totalCount, doctors] = await Promise.all([countQuery, doctorsQuery])

    const upcomingAppointments = await this.getUpcomingAppointments(
      doctors.map((d) => d.id),
    )

    const reviews = await db.query.reviews.findMany({
      where: (review) =>
        inArray(
          review.doctorId,
          doctors.map((d) => d.id),
        ),
      columns: {
        doctorId: true,
        rating: true,
      },
    })

    const subSpecialtyIds = doctors.flatMap((d) =>
      (d.subSpecialties as Array<{ id: string }>).map((s) => s.id),
    )

    const subspecialties = await db.query.subSpecialties.findMany({
      where: (subSpecialty) => inArray(subSpecialty.id, subSpecialtyIds),
    })

    const doctorsWithAllData = doctors.map((doctor) => {
      const bookedSlots = upcomingAppointments
        .filter((apt) => apt.doctorId === doctor.id)
        .map((apt) => apt.appointmentDate)

      const doctorReviews = reviews.filter((r) => r.doctorId === doctor.id)
      const averageRating = doctorReviews.length
        ? doctorReviews.reduce((acc, r) => acc + r.rating, 0) /
          doctorReviews.length
        : 0

      return {
        ...doctor,
        subSpecialties: subspecialties.filter((sub) =>
          (doctor.subSpecialties as Array<{ id: string }>).some(
            (ds) => ds.id === sub.id,
          ),
        ),
        bookedSlots,
        reviewStats: {
          averageRating,
          totalReviews: doctorReviews.length,
        },
      }
    })

    return {
      doctors: doctorsWithAllData,
      count: totalCount[0]?.count ?? 0,
    }
  }

  static async details(id: string) {
    const doctor = await db.query.doctors.findFirst({
      where: (doctor, { eq }) => eq(doctor.id, id),
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
          with: {
            profilePicture: true,
          },
        },
        facility: {
          columns: {
            placeId: true,
            name: true,
            address: true,
            town: true,
            county: true,
          },
        },
        specialty: true,
        operatingHours: true,
        reviews: true,
      },
    })

    const subSpecialties = await db.query.subSpecialties.findMany({
      where: (subSpecialty, { inArray }) =>
        inArray(
          subSpecialty.id,
          (doctor?.subSpecialties as Array<{ id: string }>).map((s) => s.id),
        ),
    })

    const reviews = doctor?.reviews
      .map((r) => r.rating)
      .filter((r) => r !== null)

    const averageRating = reviews?.length
      ? reviews.reduce((acc, rating) => acc + rating, 0) / reviews.length
      : 0

    return {
      ...doctor,
      subSpecialties,
      reviewStats: {
        averageRating,
        totalReviews: reviews?.length ?? 0,
      },
    }
  }

  static async appointmentDetails(id: string) {
    return await db.query.appointments.findFirst({
      where: (appointment, { eq }) => eq(appointment.id, id),
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
  }

  static async confirmAppointment(id: string) {
    const updatedAppointment = await db
      .update(appointments)
      .set({ status: AppointmentStatus.SCHEDULED })
      .where(
        and(
          eq(appointments.id, id),
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
  }

  static async declineAppointment(appointmentId: string, doctorId: string) {
    const updatedAppointment = await db
      .update(appointments)
      .set({ status: AppointmentStatus.CANCELLED })
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.doctorId, doctorId ?? ''),
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
  }

  static async cancelAppointment(appointmentId: string) {
    const updatedAppointment = await db
      .update(appointments)
      .set({ status: AppointmentStatus.CANCELLED })
      .where(
        and(
          eq(appointments.id, appointmentId),
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
  }

  static async postAppointment(
    doctorId: string,
    appointmentId: string,
    doctorNotes: string,
    attachment?: string,
  ) {
    const appointment = await db.query.appointments.findFirst({
      where: (appointment, { eq }) => eq(appointment.id, appointmentId),
    })

    if (!appointment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Appointment not found',
      })
    }

    if (attachment) {
      const buffer = Buffer.from(
        attachment.replace(/^data:application\/pdf;base64,/, ''),
        'base64',
      )

      const { url, pathname } = await put(
        `documents/${doctorId}/${'appointment-attachment'}`,
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
            doctorNotes: doctorNotes,
          })
          .where(eq(appointments.id, appointment.id)),
      ])

      return { success: true }
    }

    await db
      .update(appointments)
      .set({
        doctorNotes: doctorNotes,
      })
      .where(eq(appointments.id, appointment.id))

    return { success: true }
  }

  static async patients(doctorId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const patients = await db.query.appointments.findMany({
      where: (appointment) => eq(appointment.doctorId, doctorId),
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
      limit,
      offset,
    })
    return patients.map((patient) => ({
      name: `${patient.patient.user.firstName} ${patient.patient.user.lastName}`,
      lastAppointment: patient.patient.lastAppointment,
      phone: patient.patient.user.phone,
      email: patient.patient.user.email,
      dob: patient.patient.user.dob,
    }))
  }
}
