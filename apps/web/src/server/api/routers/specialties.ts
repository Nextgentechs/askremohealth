import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { eq } from 'drizzle-orm'

export const specialtiesRouter = createTRPCRouter({
  listSpecialties: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.specialties.findMany({
      columns: {
        id: true,
        name: true,
      },
    })

    return data
  }),

  listSubSpecialties: publicProcedure
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
    }),
})
