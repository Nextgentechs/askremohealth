import { createTRPCRouter, procedure, publicProcedure } from '../trpc'
import { patients, users } from '@web/server/db/schema'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { lucia } from '@web/lib/lucia'
import { cookies } from 'next/headers'
import { User } from '@web/server/services/users'

export const authRouter = createTRPCRouter({
  patients: {
    phoneValidation: publicProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.db.query.users.findFirst({
          where: (user, { eq, and }) => and(eq(user.phone, input)),
        })

        if (!user) {
          return { success: false }
        }

        return { success: true, user }
      }),

    signOut: procedure.mutation(async ({ ctx }) => {
      if (ctx.session) await lucia.invalidateSession(ctx.session.id)
      const cookie = lucia.createBlankSessionCookie()
      const cookieStore = await cookies()
      cookieStore.set(cookie.name, cookie.value, cookie.attributes)
    }),

    signup: publicProcedure
      .input(
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          email: z.string(),
          phone: z.string(),
          dob: z.string(),
          password: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const hashedPassword = await bcrypt.hash(input.password, 10)
        const user = await ctx.db.query.users.findFirst({
          where: (user) => eq(user.phone, input.phone),
        })

        if (user && !user.hasAccount) {
          await ctx.db
            .update(users)
            .set({
              firstName: input.firstName,
              lastName: input.lastName,
              phone: input.phone,
              email: input.email,
              password: hashedPassword,
              dob: new Date(input.dob),
              hasAccount: true,
            })
            .where(eq(users.id, user.id))

          return { success: true }
        }

        const newUser = await User.createUser({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          password: hashedPassword,
          dob: new Date(input.dob),
          role: 'patient',
          hasAccount: true,
        })

        await ctx.db.insert(patients).values({
          id: newUser.id,
        })

        return { success: true }
      }),
  },
})
