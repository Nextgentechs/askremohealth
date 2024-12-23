import { eq } from 'drizzle-orm'
import { createTRPCRouter, doctorProcedure, publicProcedure } from '../trpc'

export const usersRouter = createTRPCRouter({
  currentUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null

    const user = await ctx.db.query.users.findFirst({
      where: (user) => eq(user.id, ctx.user!.id),
    })
    return user ?? null
  }),
  doctor: {
    current: doctorProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null

      const doctor = await ctx.db.query.doctors.findFirst({
        where: (doctor) => eq(doctor.id, ctx.user.id),
        with: {
          specialty: true,
          user: {
            with: {
              profilePicture: true,
            },
          },
          facility: true,
          operatingHours: true,
          certificates: true,
        },
      })
      return doctor ?? null
    }),
  },
})
