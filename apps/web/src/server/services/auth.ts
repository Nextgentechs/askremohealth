import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users, patients, } from '../db/schema'
import { createUserSession } from '../lib/session'
import { redisClient } from '@web/redis/redis'
import { generateOtp } from '../lib/generateOtp'


type SignUpInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'doctor' | 'admin' | 'lab' | 'patient' // optional, inferred from host
  host?: string // pass the request host
}

type SignInInput = {
  email: string
  password: string
  host?: string // pass the request host
}

export class AuthService {
  static async signUp({ email, password, firstName, lastName, host }: SignUpInput) {
    try {
      // --- Infer role from host ---
      let role: 'patient' | 'doctor' | 'admin' | 'lab'
      if (host?.startsWith('admin.')) {
        role = 'admin' // any user signing up from admin subdomain is admin
      } else {
        role = 'patient' // default to patient for normal domain signup
      }

      // Validate role against enum
      const validRoles = ['patient', 'doctor', 'admin', 'lab'] as const
      if (!validRoles.includes(role)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid role' })
      }

      // --- Check if user exists ---
      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      })
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' })

      // --- Hash password and insert user ---
      const hashedPassword = await bcrypt.hash(password, 10)
      const insertedUsers = await db.insert(users)
        .values({ email, password: hashedPassword, firstName, lastName, role })
        .returning({ id: users.id })

      const userId = insertedUsers[0]?.id

      // --- Optional: create patient entry ---
      if (role === 'patient' && userId) {
        await db.insert(patients).values({ id: userId, userId })
      }

      return { success: true }
    } catch (error) {
      console.error('Error in signUp:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create user',
      })
    }
  }


  static async signIn({ email, password, host }: SignInInput) {
    try {
      const user = await db.query.users.findFirst({ where: eq(users.email, email) })

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unknown email' })
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Incorrect password' })
      }

      // Check admin host
      if (host?.startsWith('admin.') && user.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Only admins can login via admin subdomain',
        })
      }

      const sessionUser = { id: user.id, email: user.email ?? '' }
      const sessionId = await createUserSession(sessionUser)

      const otp = generateOtp()
      await redisClient.set(`otp:${user.email}`, otp, { ex: 300 })

      return { success: true, userId: user.id, sessionId, role: user.role, otp }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to sign in',
      })
    }
  }

  static async verifyOtp(email: string, otp: string) {
    const storedOtp = await redisClient.get(`otp:${email}`)
    if (!storedOtp || Number(storedOtp) !== Number(otp)) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired OTP' })
    }
    await redisClient.del(`otp:${email}`)
    return { success: true, message: 'OTP verified successfully' }
  }
}
