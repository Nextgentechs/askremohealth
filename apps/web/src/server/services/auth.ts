// server/services/auth.ts
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { createUserSession } from '../lib/session'

type Context = {
  req: Request
  cookies: {
    get: (key: string) => { name: string; value: string } | undefined
    set: (key: string, value: string, options: any) => void
    delete: (key: string) => void
  }
  user: any
}

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
  static async signUp({ email, password, firstName, lastName }: SignUpInput) {
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
          role: 'doctor' // Always set role to doctor
        })

      return { success: true }
    } catch (error) {
      console.error('Error in signUp:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
      })
    }
  }

  static async signIn({ email, password }: SignInInput, ctx: Context) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      console.log('user', user);

      if (!user) {
        console.warn(`SignIn attempt with unknown email: ${email}`);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.warn(`SignIn failed due to incorrect password for email: ${email}`);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      const sessionUser = { id: user.id, email: user.email ?? '' };
      await createUserSession(sessionUser, ctx.cookies);

      console.log('sessionUser', sessionUser)
      return { success: true, userId: user.id };
    } catch (error) {
      console.error('Error in signIn:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to sign in',
      });
    }
  }
}