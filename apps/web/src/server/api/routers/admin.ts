import { z } from 'zod'
import { adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { lucia } from '@web/lib/lucia'
import { cookies } from 'next/headers'

export const login = adminProcedure
  .input(
    z.object({
      phone: z.string(),
      password: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (user, { eq }) => eq(user.phone, input.phone),
    })
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'user not found',
      })
    }

    if (!user.isAdmin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'user not found',
      })
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password!)
    if (!passwordMatch) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid password',
      })
    }

    const session = await lucia.createSession(user.id, {})
    const cookie = lucia.createSessionCookie(session.id)
    const cookieStore = await cookies()
    cookieStore.set(cookie.name, cookie.value, cookie.attributes)

    return { success: true }
  })
