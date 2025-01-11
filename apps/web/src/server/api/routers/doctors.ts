import { createTRPCRouter, publicProcedure } from '../trpc'
import { z } from 'zod'
import { doctors as doctorsTable } from '@web/server/db/schema'
import { Doctors } from '@web/server/services/doctors'

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
    .query(async ({ input }) => {
      return Doctors.list(input)
    }),

  details: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const doctor = await ctx.db.query.doctors.findFirst({
      where: (doctor, { eq }) => eq(doctorsTable.id, input),
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
