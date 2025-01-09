import { type Context } from '../api/trpc'
import {
  doctors as doctorsTable,
  facilities,
  users,
} from '@web/server/db/schema'
import {
  count,
  exists,
  inArray,
  gte,
  sql,
  eq,
  or,
  between,
  and,
  ilike,
} from 'drizzle-orm'
import { db } from '@web/server/db'

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

export class DoctorService {
  static buildDoctorFilters(input: FilterInput) {
    return or(
      input.specialty ? eq(doctorsTable.specialty, input.specialty) : undefined,
      input.subSpecialties?.length
        ? sql`${doctorsTable.subSpecialties}::jsonb ?| array[${sql.join(input.subSpecialties)}]`
        : undefined,
      input.experiences?.length
        ? or(
            ...input.experiences.map((range) =>
              range.max
                ? between(doctorsTable.experience, range.min, range.max)
                : gte(doctorsTable.experience, range.min),
            ),
          )
        : undefined,
      input.genders?.length
        ? inArray(doctorsTable.gender, input.genders)
        : undefined,
      input.entities?.length || input.town || input.county
        ? exists(
            db
              .select()
              .from(facilities)
              .where(
                and(
                  eq(facilities.placeId, doctorsTable.facility),
                  input.entities?.length
                    ? inArray(facilities.type, input.entities)
                    : undefined,
                  input.town ? eq(facilities.town, input.town) : undefined,
                  input.county
                    ? eq(facilities.county, input.county)
                    : undefined,
                ),
              ),
          )
        : undefined,
      input.query
        ? exists(
            db
              .select()
              .from(users)
              .where(
                and(
                  eq(users.id, doctorsTable.id),
                  or(
                    ilike(users.firstName, `%${input.query}%`),
                    ilike(users.lastName, `%${input.query}%`),
                  ),
                ),
              ),
          )
        : undefined,
    )
  }

  static async getUpcomingAppointments(ctx: Context, doctorIds: string[]) {
    const today = new Date()
    return ctx.db.query.appointments.findMany({
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

  static async getDoctorRatings(ctx: Context, doctorIds: string[]) {
    return ctx.db.query.appointments.findMany({
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

  static async list(
    ctx: Context,
    input: FilterInput & { page: number; limit: number },
  ) {
    const { page, limit } = input
    const offset = (page - 1) * limit

    const filters = this.buildDoctorFilters(input)

    const totalCount = await ctx.db
      .select({ value: count() })
      .from(doctorsTable)
      .where(filters)
      .then((res) => res[0]?.value ?? 0)

    const doctors = await ctx.db.query.doctors.findMany({
      where: () => filters,
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
      limit,
      offset,
    })

    const [upcomingAppointments, doctorRatings] = await Promise.all([
      this.getUpcomingAppointments(
        ctx,
        doctors.map((d) => d.id),
      ),
      this.getDoctorRatings(
        ctx,
        doctors.map((d) => d.id),
      ),
    ])

    const subSpecialtyIds = doctors.flatMap((d) =>
      (d.subSpecialties as Array<{ id: string }>).map((s) => s.id),
    )

    const subspecialties = await ctx.db.query.subSpecialties.findMany({
      where: (subSpecialty, { inArray }) =>
        inArray(subSpecialty.id, subSpecialtyIds),
    })

    const doctorsWithAllData = doctors.map((doctor) => {
      const bookedSlots = upcomingAppointments
        .filter((apt) => apt.doctorId === doctor.id)
        .map((apt) => apt.appointmentDate)

      const reviews = doctorRatings
        .filter((apt) => apt.doctorId === doctor.id)
        .map((apt) => apt.review?.rating)
        .filter((rating): rating is number => rating !== null)

      const averageRating = reviews.length
        ? reviews.reduce((acc, rating) => acc + rating, 0) / reviews.length
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
          totalReviews: reviews.length,
        },
      }
    })

    return {
      doctors: doctorsWithAllData,
      count: totalCount,
    }
  }
}
