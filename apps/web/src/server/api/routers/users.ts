import { eq } from 'drizzle-orm'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const usersRouter = createTRPCRouter({
  currentUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null

    const user = await ctx.db.query.users.findFirst({
      where: (user) => eq(user.id, ctx.user!.id),
    })
    return user ?? null
  }),
})
