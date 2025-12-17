/**
 * OTP Verification Endpoint
 *
 * Verifies the OTP entered by the user during two-factor authentication.
 *
 * SECURITY:
 * - Rate limited to prevent brute force attacks (3 attempts per minute)
 * - OTP is validated against Redis stored value
 * - Rate limit is cleared on successful verification
 */
import {
  checkRateLimit,
  clearRateLimit,
  getClientIP,
  RATE_LIMITS,
} from '@web/server/lib/rate-limiter'
import { AuthService } from '@web/server/services/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { otp, email } = body

    if (!otp || !email) {
      return NextResponse.json(
        { success: false, message: 'OTP and email are required' },
        { status: 400 },
      )
    }

    // Rate limiting - prevents brute force OTP guessing
    const clientIP = getClientIP(request)
    const rateLimitKey = `${clientIP}:${email}`
    const rateLimitResult = await checkRateLimit(rateLimitKey, RATE_LIMITS.otp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many verification attempts. Please try again in ${rateLimitResult.resetInSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetInSeconds.toString(),
          },
        },
      )
    }

    const result = await AuthService.verifyOtp(email, otp)

    // Clear rate limit on successful verification
    if (result.success) {
      await clearRateLimit(rateLimitKey, RATE_LIMITS.otp)
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'OTP verification failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
