/**
 * Password Reset Completion API
 *
 * Handles the final step of password reset:
 * 1. Validates reset token
 * 2. Validates new password strength
 * 3. Updates user's password
 * 4. Invalidates reset token
 *
 * POST /api/auth/reset-password
 * Body: { token: string, password: string }
 *
 * GET /api/auth/reset-password?token=xxx
 * Validates token before showing reset form
 *
 * @security Rate limited to prevent brute force
 */

import { passwordSchema } from '@web/server/api/validators'
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
} from '@web/server/lib/rate-limiter'
import { AuthService } from '@web/server/services/auth'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Input validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
})

/**
 * Validate reset token before showing form
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Reset token is required' },
        { status: 400 },
      )
    }

    const result = await AuthService.verifyResetToken(token)

    return NextResponse.json({
      valid: result.valid,
      message: result.valid
        ? 'Token is valid'
        : 'Invalid or expired reset link. Please request a new one.',
    })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { valid: false, message: 'An error occurred' },
      { status: 500 },
    )
  }
}

/**
 * Complete password reset
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit(
      clientIP,
      RATE_LIMITS.passwordReset,
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many attempts. Please try again later.',
          resetInSeconds: rateLimitResult.resetInSeconds,
        },
        { status: 429 },
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = resetPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0]?.message,
          errors: validation.error.errors,
        },
        { status: 400 },
      )
    }

    const { token, password } = validation.data

    // Reset password
    const result = await AuthService.resetPassword(token, password)

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error: unknown) {
    console.error('Password reset error:', error)

    // Handle specific TRPCError messages
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to reset password'
    const isTokenError = errorMessage.includes('Invalid or expired')

    return NextResponse.json(
      {
        success: false,
        message: isTokenError
          ? 'This reset link has expired. Please request a new one.'
          : 'Failed to reset password. Please try again.',
      },
      { status: isTokenError ? 401 : 500 },
    )
  }
}
