import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users, patients, roleEnum } from '../db/schema'
import { createUserSession } from '../lib/session'
import { redisClient } from '@web/redis/redis'
import { generateOtp } from '../lib/generateOtp'


type SignUpInput = {
  email: string
  password: string
  firstName: string
  lastName: string   
}

type SignInInput = {
  email: string
  password: string
}


export class AuthService {
  static async signUp({ email, password, firstName, lastName }: SignUpInput, requestHost?: string) {
    try {
      console.log('=== SIGNUP DEBUG INFO ===')
      console.log('Input email:', email)
      console.log('Request host:', requestHost)

      // First, let's check what enum values are available
      console.log('Available role enum values:', roleEnum.enumValues)
      
      let role: any = 'patient';
      
      if (requestHost?.includes('admin.')) {
        console.log('Admin subdomain detected')
        role = 'admin';
      } else {
        console.log('Default domain, setting role to patient')
        role = 'patient';
      }

      console.log('Selected role:', role)
      console.log('Role type:', typeof role)

      // Check if role exists in enum
      const isValidRole = roleEnum.enumValues.includes(role)
      console.log('Is valid role?', isValidRole)

      if (!isValidRole) {
        console.error('INVALID ROLE DETECTED:', role)
        console.error('Expected one of:', roleEnum.enumValues)
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: `Invalid role "${role}". Must be one of: ${roleEnum.enumValues.join(', ')}` 
        })
      }

      // Check if user already exists
      console.log('Checking for existing user...')
      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      })
      
      if (existing) {
        console.log('User already exists:', email)
        throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' })
      }

      console.log('Hashing password...')
      const hashedPassword = await bcrypt.hash(password, 10)
      
      console.log('Inserting user with role:', role)
      const insertedUsers = await db.insert(users)
        .values({ 
          email, 
          password: hashedPassword, 
          firstName, 
          lastName, 
          role 
        })
        .returning({ id: users.id })

      console.log('User inserted successfully, ID:', insertedUsers[0]?.id)
      const userId = insertedUsers[0]?.id

      // Insert into patients table if role is patient
      if (role === 'patient' && userId) {
        console.log('Inserting into patients table...')
        await db.insert(patients).values({ id: userId, userId })
      }

      console.log('=== SIGNUP COMPLETED SUCCESSFULLY ===')
      return { success: true }
    } catch ( error) {
      if(error instanceof Error) {
      console.error('=== SIGNUP ERROR ===')
      console.error('Error type:', error?.constructor?.name)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      }
      if (error instanceof TRPCError) {
        console.log('TRPCError with code:', error.code)
        throw error;
      }
      
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