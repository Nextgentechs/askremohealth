import { clerkClient } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'
import { del, put } from '@vercel/blob'
import { db } from '@web/server/db'
import {
  appointmentAttachments,
  appointmentLogs,
  appointments,
  certificates,
  doctors as doctorsTable,
  facilities,
  operatingHours,
  patients as patientsTable,
  profilePictures,
} from '@web/server/db/schema'
import {
  and,
  between,
  count,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  or,
  sql,
} from 'drizzle-orm'
import sharp from 'sharp'
import {
  type AvailabilityDetailsSchema,
  type PersonalDetailsSchema,
  type ProfessionalDetailsSchema,
} from '../api/validators'
import { KENYA_COUNTIES } from '../data/kenya-counties'
import { AppointmentStatus } from '../utils'
import { Facility } from './facilities'

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
  static async updatePersonalDetails(
    input: PersonalDetailsSchema,
    userId: string,
  ) {
    await db.transaction(async (trx) => {
      const [doctor] = await trx
        .insert(doctorsTable)
        .values({
          id: userId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          bio: input.bio,
          gender: input.gender,
          title: input.title,
          dob: new Date(input.dob),
          status: 'pending',
        })
        .onConflictDoUpdate({
          target: doctorsTable.id,
          set: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            bio: input.bio,
            gender: input.gender,
            title: input.title,
            dob: new Date(input.dob),
          },
        })
        .returning()

      if (!doctor) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Failed to create doctor',
        })
      }

      if (!input.profilePicture) return { success: true }

      const base64Data = input.profilePicture.replace(
        /^data:image\/\w+;base64,/,
        '',
      )
      const buffer = await sharp(Buffer.from(base64Data, 'base64'))
        .resize(400, 400, { fit: 'cover', position: 'center' })
        .webp({ quality: 80 })
        .toBuffer()

      const fileName = `profile-picture-${userId}.webp`

      const { url, pathname } = await put(fileName, buffer, {
        access: 'public',
        contentType: `image/webp`,
      })

      await trx.insert(profilePictures).values({
        doctorId: doctor.id,
        url,
        path: pathname,
      })
    })

    return { success: true }
  }

  static async updateProfilePicture(input: {
    userId: string
    profilePicture: string
  }) {
    const doctor = await db.query.doctors.findFirst({
      where: (doctor) => eq(doctor.id, input.userId),
      with: {
        profilePicture: true,
      },
    })

    if (!doctor) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Doctor not found',
      })
    }

    if (doctor.profilePicture) {
      await del(doctor.profilePicture.url)
    }

    const base64Data = input.profilePicture.replace(
      /^data:image\/\w+;base64,/,
      '',
    )
    const buffer = await sharp(Buffer.from(base64Data, 'base64'))
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toBuffer()

    const { url, pathname } = await put(
      `profile-picture-${input.userId}.webp`,
      buffer,
      {
        access: 'public',
        contentType: `image/webp`,
      },
    )

    await db
      .update(profilePictures)
      .set({
        url,
        path: pathname,
      })
      .where(eq(profilePictures.doctorId, input.userId))

    return { success: true }
  }

  static async updateProfessionalDetails(
    input: ProfessionalDetailsSchema,
    userId: string,
  ) {
    await db.transaction(async (trx) => {
      const doctor = await db.query.doctors.findFirst({
        where: (doctor) => eq(doctor.id, userId),
      })

      if (!doctor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Doctor not found',
        })
      }

      const facility = await Facility.register(input.facility)

      await trx
        .update(doctorsTable)
        .set({
          specialty: input.specialty,
          subSpecialties: input.subSpecialty.map((id) => ({ id })),
          experience: input.experience,
          facility: facility?.placeId,
          licenseNumber: input.registrationNumber,
        })
        .where(eq(doctorsTable.id, userId))

      if (input.medicalLicense) {
        const buffer = Buffer.from(
          input.medicalLicense.replace(/^data:application\/pdf;base64,/, ''),
          'base64',
        )

        const { url, pathname } = await put(
          `documents/${userId}/${'medical-license'}`,
          buffer,
          {
            access: 'public',
            contentType: `application/pdf`,
          },
        )

        await trx.insert(certificates).values({
          doctorId: userId,
          name: pathname,
          url,
        })
      }
    })

    return { success: true }
  }

  static async updateAvailabilityDetails(
    input: AvailabilityDetailsSchema,
    userId: string,
  ) {
    const client = await clerkClient()
    await db.transaction(async (trx) => {
      await trx
        .update(doctorsTable)
        .set({
          consultationFee: input.consultationFee,
        })
        .where(eq(doctorsTable.id, userId))

      await trx
        .update(operatingHours)
        .set({
          schedule: input.operatingHours,
          consultationDuration: input.appointmentDuration,
        })
        .where(eq(operatingHours.doctorId, userId))
      await client.users.updateUser(userId, {
        publicMetadata: {
          onboardingComplete: true,
          role: 'specialist',
        },
      })
    })

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
        profilePicture: true,
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
        profilePicture: true,
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
            profilePicture: true,
          },
        },
        patient: {
          columns: {
            id: true,
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

  static async patients(filter: {
    query?: string
    doctorId: string
    page: number
    limit: number
  }) {
    const offset = (filter.page - 1) * filter.limit

    const countQuery = db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, filter.doctorId),
          filter.query
            ? or(
                ilike(patientsTable.firstName, `%${filter.query}%`),
                ilike(patientsTable.lastName, `%${filter.query}%`),
              )
            : undefined,
        ),
      )

    const patientsQuery = db
      .select({
        patientId: appointments.patientId,
        firstName: patientsTable.firstName,
        lastName: patientsTable.lastName,
        lastAppointment: patientsTable.lastAppointment,
        phone: patientsTable.phone,
        email: patientsTable.email,
        dob: patientsTable.dob,
      })
      .from(appointments)
      .innerJoin(patientsTable, eq(appointments.patientId, patientsTable.id))
      .where(
        and(
          eq(appointments.doctorId, filter.doctorId),
          filter.query
            ? or(
                ilike(patientsTable.firstName, `%${filter.query}%`),
                ilike(patientsTable.lastName, `%${filter.query}%`),
              )
            : undefined,
        ),
      )
      .limit(filter.limit)
      .offset(offset)

    const [totalCount, patients] = await Promise.all([
      countQuery,
      patientsQuery,
    ])

    return {
      patients: patients.map((patient) => ({
        name: `${patient.firstName} ${patient.lastName}`,
        lastAppointment: patient.lastAppointment,
        phone: patient.phone,
        email: patient.email,
        dob: patient.dob,
      })),
      pagination: {
        total: totalCount[0]?.count ?? 0,
        pages: Math.ceil((totalCount[0]?.count ?? 0) / filter.limit),
      },
    }
  }
}
