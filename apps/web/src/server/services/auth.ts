import { TRPCError } from '@trpc/server'
import { redisClient } from '@web/redis/redis'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { patients, users } from '../db/schema'
import { generateOtp } from '../lib/generateOtp'
import { createUserSession, invalidateUserSessions } from '../lib/session'

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

/**
 * Generates a secure random token for password reset links
 * Uses crypto.randomBytes for cryptographic security
 */
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export class AuthService {
  static async signUp({
    email,
    password,
    firstName,
    lastName,
    role,
  }: SignUpInput) {
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

      const insertedUsers = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role,
        })
        .returning({ id: users.id })

      const userId = insertedUsers[0]?.id

      if (role === 'patient' && userId) {
        await db.insert(patients).values({
          id: userId,
          userId: userId,
          // phone, dob, emergencyContact can be set later during onboarding
        })
      }

      return { success: true }
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
      })

      if (!user) {
        console.warn(`SignIn attempt with unknown email: ${email}`)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'SignIn attempt with unknown email',
        })
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        console.warn(
          `SignIn failed due to incorrect password for email: ${email}`,
        )
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'SignIn failed due to incorrect password for email',
        })
      }

      const sessionUser = { id: user.id, email: user.email ?? '' }
      // Only create the session and return the sessionId
      const sessionId = await createUserSession(sessionUser)
      // send the otp via email

      // Generate OTP and store in Redis (never expose OTP in API response)
      const otp = generateOtp()
      await redisClient.set(`otp:${user.email}`, otp, {
        ex: 300, // OTP expires in 5 minutes
      })

      // Return success without OTP - OTP will be sent via email separately
      return {
        success: true,
        userId: user.id,
        sessionId,
        role: user.role,
        email: user.email,
      }
    } catch (error) {
      console.log(error)
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to sign in',
      })
    }
  }
  static async verifyOtp(email: string, otp: string) {
    try {
      const storedOtp = await redisClient.get(`otp:${email}`)

      console.log('storedOtp', storedOtp)
      console.log('otp', otp)

      if (!storedOtp || Number(storedOtp) !== Number(otp)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired OTP',
        })
      }

      await redisClient.del(`otp:${email}`)

      return {
        success: true,
        message: 'otp verified successfully',
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error ? error.message : 'OTP verification failed',
      })
    }
  }

  /**
   * Initiates password reset flow
   * 1. Generates a secure reset token
   * 2. Stores token in Redis with 1-hour expiry
   * 3. Returns token (to be sent via email by caller)
   *
   * @param email - User's email address
   * @returns Reset token and success status
   */
  static async requestPasswordReset(email: string) {
    try {
      // Check if user exists (don't reveal this in error message for security)
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      // Always return success to prevent email enumeration attacks
      if (!user) {
        console.info(
          `Password reset requested for non-existent email: ${email}`,
        )
        return {
          success: true,
          message: 'If the email exists, a reset link has been sent',
        }
      }

      // Generate secure reset token
      const resetToken = generateResetToken()

      // Store token in Redis with 1-hour expiry
      // Key format: reset:token:{token} -> email
      await redisClient.set(`reset:token:${resetToken}`, email, {
        ex: 3600, // 1 hour
      })

      // Also track that we've sent a reset for this email (rate limiting)
      await redisClient.set(`reset:email:${email}`, '1', {
        ex: 60, // Can only request once per minute
      })

      return {
        success: true,
        resetToken, // Caller sends this via email
        message: 'If the email exists, a reset link has been sent',
      }
    } catch (error) {
      console.error('Error in requestPasswordReset:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process password reset request',
      })
    }
  }

  /**
   * Verifies reset token without consuming it
   * Used to validate token before showing reset form
   *
   * @param token - The reset token from the email link
   * @returns Whether token is valid
   */
  static async verifyResetToken(token: string) {
    try {
      const email = await redisClient.get(`reset:token:${token}`)
      return { valid: !!email, email: email ?? undefined }
    } catch (error) {
      console.error('Error in verifyResetToken:', error)
      return { valid: false }
    }
  }

  /**
   * Completes password reset flow
   * 1. Validates token
   * 2. Updates user's password
   * 3. Invalidates token
   *
   * @param token - The reset token
   * @param newPassword - The new password to set
   */
  static async resetPassword(token: string, newPassword: string) {
    try {
      // Get email from token
      const emailResult = await redisClient.get(`reset:token:${token}`)
      const email = typeof emailResult === 'string' ? emailResult : null

      if (!email) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired reset token',
        })
      }

      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update password
      await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, user.id))

      // Invalidate reset token
      await redisClient.del(`reset:token:${token}`)

      // Invalidate any existing sessions for security
      // (User should re-login with new password)
      await invalidateUserSessions(user.id)

      return { success: true, message: 'Password has been reset successfully' }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      console.error('Error in resetPassword:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reset password',
      })
    }
  }
}
