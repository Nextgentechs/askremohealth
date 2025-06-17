import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { createUserSession } from '../lib/session'
import { redisClient } from '@web/redis/redis'
import { generateOtp } from '../lib/generateOtp'


type SignUpInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'doctor' | 'admin' | 'patient'
}

type SignInInput = {
  email: string
  password: string
}


export class AuthService {
  static async signUp({ email, password, firstName, lastName, role }: SignUpInput) {
    try {
      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      await db
        .insert(users)
        .values({ 
          email, 
          password: hashedPassword, 
          firstName, 
          lastName,
          role
        })
        const otp = generateOtp()
        await redisClient.set(`otp:${email}`, otp, {
          ex: 300,
        })
      return { success: true,otp:otp }
    } catch (error) {
      console.error('Error in signUp:', error)
    
      if (error instanceof Error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
    
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
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