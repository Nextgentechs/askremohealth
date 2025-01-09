import { createTRPCRouter, publicProcedure } from '../trpc'
import { z } from 'zod'
import { facilities, users } from '@web/server/db/schema'
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
import { doctors as doctorsTable } from '@web/server/db/schema'

export const doctorsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        specialty: z.string().optional(),
        subSpecialties: z.array(z.string()).optional(),
        experiences: z
          .array(
            z.object({
              min: z.number(),
              max: z.number().optional(),
            }),
          )
          .optional(),
        genders: z.array(z.enum(['male', 'female'])).optional(),
        entities: z.array(z.string()).optional(),
        query: z.string().optional(),
        county: z.string().optional(),
        town: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input
      const offset = (page - 1) * limit

      const totalCount = await ctx.db
        .select({ value: count() })
        .from(doctorsTable)
        .where(
          or(
            input.specialty
              ? eq(doctorsTable.specialty, input.specialty)
              : undefined,
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
                  ctx.db
                    .select()
                    .from(facilities)
                    .where(
                      and(
                        eq(facilities.placeId, doctorsTable.facility),
                        input.entities?.length
                          ? inArray(facilities.type, input.entities)
                          : undefined,
                        input.town
                          ? eq(facilities.town, input.town)
                          : undefined,
                        input.county
                          ? eq(facilities.county, input.county)
                          : undefined,
                      ),
                    ),
                )
              : undefined,
            input.query
              ? exists(
                  ctx.db
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
          ),
        )

      const doctors = await ctx.db.query.doctors.findMany({
        where: (
          doctor,
          { eq, between, and, or, gte, ilike, exists, inArray, sql },
        ) =>
          or(
            input.specialty ? eq(doctor.specialty, input.specialty) : undefined,
            input.subSpecialties?.length
              ? sql`${doctor.subSpecialties}::jsonb ?| array[${sql.join(input.subSpecialties)}]`
              : undefined,
            input.experiences?.length
              ? or(
                  ...input.experiences.map((range) =>
                    range.max
                      ? between(doctor.experience, range.min, range.max)
                      : gte(doctor.experience, range.min),
                  ),
                )
              : undefined,
            input.genders?.length
              ? inArray(doctor.gender, input.genders)
              : undefined,
            input.entities?.length || input.town || input.county
              ? exists(
                  ctx.db
                    .select()
                    .from(facilities)
                    .where(
                      and(
                        eq(facilities.placeId, doctor.facility),
                        input.entities?.length
                          ? inArray(facilities.type, input.entities)
                          : undefined,
                        input.town
                          ? eq(facilities.town, input.town)
                          : undefined,
                        input.county
                          ? eq(facilities.county, input.county)
                          : undefined,
                      ),
                    ),
                )
              : undefined,
            input.query
              ? exists(
                  ctx.db
                    .select()
                    .from(users)
                    .where(
                      and(
                        eq(users.id, doctor.id),
                        or(
                          ilike(users.firstName, `%${input.query}%`),
                          ilike(users.lastName, `%${input.query}%`),
                        ),
                      ),
                    ),
                )
              : undefined,
          ),

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

      const today = new Date()
      const upcomingAppointments = await ctx.db.query.appointments.findMany({
        where: (appointment, { and, gte, inArray }) =>
          and(
            inArray(
              appointment.doctorId,
              doctors.map((d) => d.id),
            ),
            gte(appointment.appointmentDate, today),
            inArray(appointment.status, ['scheduled', 'in_progress']),
          ),
        columns: {
          doctorId: true,
          appointmentDate: true,
        },
      })

      const doctorRatings = await ctx.db.query.appointments.findMany({
        where: (appointment, { inArray }) =>
          inArray(
            appointment.doctorId,
            doctors.map((d) => d.id),
          ),
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
        count: totalCount[0]?.value ?? 0,
      }
    }),
  details: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const doctor = await ctx.db.query.doctors.findFirst({
      where: eq(doctorsTable.id, input),
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

    const subSpecialties = await ctx.db.query.subSpecialties.findMany({
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
  }),
})
