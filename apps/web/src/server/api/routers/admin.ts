import { z } from 'zod'
import { adminProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { lucia } from '@web/lib/lucia'
import { cookies } from 'next/headers'
import { count } from 'drizzle-orm'
import { doctors } from '@web/server/db/schema'

export const login = publicProcedure
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

export const getDoctors = adminProcedure
  .input(
    z.object({ page: z.number().default(1), limit: z.number().default(10) }),
  )
  .query(async ({ ctx, input }) => {
    const [total, data] = await Promise.all([
      ctx.db.select({ count: count() }).from(doctors),
      ctx.db.query.doctors.findMany({
        with: {
          user: true,
          certificates: true,
        },
        offset: Math.max(1, (input.page - 1) * input.limit),
        limit: input.limit,
      }),
    ])

    return {
      pagination: {
        total: total[0]?.count ?? 0,
        pages: Math.ceil((total[0]?.count ?? 0) / input.limit),
      },
      data,
    }
  })

export const getDoctor = adminProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    return ctx.db.query.doctors.findFirst({
      where: (doctor, { eq }) => eq(doctor.id, input.id),
      with: {
        user: true,
      },
    })
  })
