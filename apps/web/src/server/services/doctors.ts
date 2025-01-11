import { doctors as doctorsTable, facilities } from '@web/server/db/schema'
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
  static async getUpcomingAppointments(doctorIds: string[]) {
    const today = new Date()
    return db.query.appointments.findMany({
      where: (appointment, { and, gte, inArray }) =>
        and(
          inArray(appointment.doctorId, doctorIds),
          gte(appointment.appointmentDate, today),
          inArray(appointment.status, ['scheduled', 'in_progress']),
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
}
