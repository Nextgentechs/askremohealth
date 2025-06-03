import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { createUserSession } from '../lib/session'

// type CookieOptions = {
//   secure?: boolean
//   httpOnly?: boolean
//   sameSite?: 'lax' | 'strict' | 'none'
//   maxAge?: number
//   path?: string
// }

// If Context is not used, remove it entirely to fix the lint warning
// type Context = {
//   req: Request
//   cookies: {
//     get: (key: string) => { name: string; value: string } | undefined
//     set: (key: string, value: string, options: Partial<CookieOptions>) => void
//     delete: (key: string) => void
//   }
//   user: unknown
// }

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

      return { success: true }
    } catch (error) {
      console.error('Error in signUp:', error)
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

      return { success: true, userId: user.id, sessionId };
    } catch (error) {
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