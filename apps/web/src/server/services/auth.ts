import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users, patients } from '../db/schema'
import { createUserSession } from '../lib/session'
import { redisClient } from '@web/redis/redis'
import { generateOtp } from '../lib/generateOtp'


type SignUpInput = {
  email: string
  password: string
  firstName: string
  lastName: string 
  host?: string
}

type SignInInput = {
  email: string
  password: string
}


export class AuthService {
  static async signUp({ email, password, firstName, lastName, host }: SignUpInput) {
  try {
    // Infer role from host
    let role: 'doctor' | 'admin' | 'lab' | 'patient'
    if (host?.startsWith('admin.')) {
      role = 'admin'
    } else {
      role = 'patient' // default for main domain
    }

    // Validate role against enum
    const validRoles = ['patient', 'doctor', 'admin', 'lab'] as const
    if (!validRoles.includes(role)) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid role' })
    }

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' })
    }

    // Hash password and insert
    const hashedPassword = await bcrypt.hash(password, 10)
    const insertedUsers = await db.insert(users)
      .values({ email, password: hashedPassword, firstName, lastName, role })
      .returning({ id: users.id })

    const userId = insertedUsers[0]?.id

    // Optional: insert into patients table if role is patient
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
  
  static async signIn({ email, password }: SignInInput) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });


      if (!user) {
        console.warn(`SignIn attempt with unknown email: ${email}`);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'SignIn attempt with unknown email',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.warn(`SignIn failed due to incorrect password for email: ${email}`);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'SignIn failed due to incorrect password for email',
        });
      }

      const sessionUser = { id: user.id, email: user.email ?? '' };
      // Only create the session and return the sessionId
      const sessionId = await createUserSession(sessionUser);
      // send the otp via email

      const otp = generateOtp()
      await redisClient.set(`otp:${user.email}`, otp, {
        ex: 300,
      })

      return { success: true, userId: user.id, sessionId, role: user.role, otp:otp };
    } catch (error) {
      console.log(error)
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to sign in',
      });
    }
  }
  static async verifyOtp(email: string, otp: string) {
    try {
      const storedOtp = await redisClient.get(`otp:${email}`);

      console.log('storedOtp', storedOtp)
      console.log('otp',otp)
  
      if (!storedOtp || Number(storedOtp) !== Number(otp)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired OTP',
        });
      }
  
      await redisClient.del(`otp:${email}`);

      return {
        success: true,
        message:'otp verified successfully'
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'OTP verification failed',
      });
    }
  }
  
}