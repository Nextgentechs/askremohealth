import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  certificates,
  doctors,
  operatingHours,
  profilePictures,
  type User,
  users,
} from '@web/server/db/schema'
import bcrypt from 'bcrypt'
import { TRPCError } from '@trpc/server'
import { put } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { doctorSignupSchema } from '../schema'
import sharp from 'sharp'
import { z } from 'zod'
import { lucia } from '@web/lib/lucia'
import { cookies } from 'next/headers'
import { type JWTPayload, SignJWT } from 'jose'
import { env } from '@web/env'

export async function sign<T extends JWTPayload>({
  payload,
  sub,
  exp,
}: {
  payload: T
  sub: string
  exp: `${number} ${
    | 'seconds'
    | 'secs'
    | 's'
    | 'minutes'
    | 'mins'
    | 'm'
    | 'hours'
    | 'hrs'
    | 'h'
    | 'days'
    | 'd'
    | 'weeks'
    | 'w'
    | 'years'
    | 'yrs'
    | 'y'}`
}) {
  const token = new SignJWT(payload)
    .setAudience('https://askvirtualhealthcare.com')
    .setIssuer('https://askvirtualhealthcare.com')
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(exp)
    .setProtectedHeader({ alg: 'HS256' })

  return await token.sign(new TextEncoder().encode(env.JWT_SECRET))
}

export async function createAuthorizationToken(payload: User) {
  return {
    accessToken: await sign({ payload, sub: payload.id, exp: '10 minutes' }),
    refreshToken: await sign({ payload, sub: payload.id, exp: '180 days' }),
  }
}

export const authRouter = createTRPCRouter({
  doctorSignup: publicProcedure
    .input(doctorSignupSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (user) => eq(user.phone, input.phone),
      })

      if (user) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        })
      }
      await ctx.db.transaction(async (trx) => {
        const hashedPassword = await bcrypt.hash(input.password, 10)

        const [user] = await trx
          .insert(users)
          .values({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            password: hashedPassword,
            role: 'doctor',
            dob: new Date(input.dob),
          })
          .returning()

        if (!user) {
          throw new TRPCError({
            code: 'NOT_IMPLEMENTED',
            message: 'Failed to create user',
          })
        }

        await trx.insert(doctors).values({
          id: user.id,
          bio: input.bio,
          specialty: input.specialty,
          subSpecialties: input.subSpecialty.map((id) => ({ id })),
          experience: input.experience,
          facility: input.facility,
          licenseNumber: input.registrationNumber,
        })

        await trx.insert(operatingHours).values({
          doctorId: user.id,
          schedule: input.operatingHours,
        })

        if (input.medicalLicense) {
          const buffer = Buffer.from(
            input.medicalLicense.replace(/^data:application\/pdf;base64,/, ''),
            'base64',
          )

          const { url, pathname } = await put(
            `documents/${user.id}/${'medical-license'}`,
            buffer,
            {
              access: 'public',
              contentType: `application/pdf`,
            },
          )

          await trx.insert(certificates).values({
            doctorId: user.id,
            name: pathname,
            url,
          })
        }

        if (input.profilePicture) {
          const base64Data = input.profilePicture.replace(
            /^data:image\/\w+;base64,/,
            '',
          )
          const buffer = await sharp(Buffer.from(base64Data, 'base64'))
            .resize(400, 400, {
              fit: 'cover',
              position: 'center',
            })
            .webp({ quality: 80 })
            .toBuffer()

          const fileName = `profile-picture-${user.id}.webp`

          const { url, pathname } = await put(fileName, buffer, {
            access: 'public',
            contentType: `image/webp`,
          })

          await trx.insert(profilePictures).values({
            id: user.id,
            url,
            path: pathname,
          })
        }
      })

      return { success: true }
    }),

  doctorLogin: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (user) => eq(user.phone, input.phone),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const passwordMatch = await bcrypt.compare(input.password, user.password)

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

      const authorizationToken = await createAuthorizationToken(user)

      if (authorizationToken) return { success: true, authorizationToken }

      return { success: false }
    }),
})
