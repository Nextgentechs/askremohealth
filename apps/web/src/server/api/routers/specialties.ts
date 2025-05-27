import { z } from 'zod'
import { publicProcedure } from '../trpc'
import { eq } from 'drizzle-orm'

export const listSpecialties = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.db) {
    throw new Error('Database client not found in context');
  }
  const data = await ctx.db.query.specialties.findMany({
    columns: {
      id: true,
      name: true,
    },
  })

  return data
})

export const listSubSpecialties = publicProcedure
  .input(
    z.object({
      specialityId: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const data = await ctx.db.query.subSpecialties.findMany({
      where: (subspecialty) => eq(subspecialty.specialty, input.specialityId),
      columns: {
        id: true,
        specialty: true,
        name: true,
      },
    })

    return data
  })
