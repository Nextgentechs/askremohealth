import { eq } from 'drizzle-orm'
import { createTRPCRouter, procedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { users } from '@web/server/db/schema'
import bcrypt from 'bcrypt'
import { lucia } from '@web/lib/lucia'
import { cookies } from 'next/headers'

export const usersRouter = createTRPCRouter({
  currentUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null

    const user = await ctx.db.query.users.findFirst({
      where: (user) => eq(user.id, ctx.user!.id),
    })
    return user ?? null
  }),

  patients: {
    details: publicProcedure
      .input(z.string().optional())
      .query(async ({ ctx, input }) => {
        if (!input) return null
        const patient = await ctx.db.query.patients.findFirst({
          where: (patient) => eq(patient.id, input),
          with: {
            user: true,
          },
        })
        return patient
      }),

    updateProfile: procedure
      .input(
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          email: z.string(),
          phone: z.string(),
          dob: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.db.query.users.findFirst({
          where: (user) => eq(user.id, ctx.user.id),
        })

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        await ctx.db
          .update(users)
          .set({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            dob: new Date(input.dob),
          })
          .where(eq(users.id, ctx.user.id))

        return { success: true }
      }),

    updatePassword: procedure
      .input(
        z.object({
          oldPassword: z.string(),
          newPassowrd: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.db.query.users.findFirst({
          where: (user, { eq, and }) =>
            and(eq(user.id, ctx.user.id), eq(user.hasAccount, true)),
        })
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        const passwordMatch = await bcrypt.compare(
          input.oldPassword,
          user.password!,
        )
        if (!passwordMatch) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Old Password is incorrect',
          })
        }
        const hashedPassword = await bcrypt.hash(input.newPassowrd, 10)
        await ctx.db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, user.id))

        if (ctx.session) await lucia.invalidateSession(ctx.session.id)
        const cookie = lucia.createBlankSessionCookie()
        const cookieStore = await cookies()
        cookieStore.set(cookie.name, cookie.value, cookie.attributes)

        return { success: true }
      }),
  },
})
