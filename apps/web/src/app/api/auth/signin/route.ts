/**
 * Sign In API Endpoint
 *
 * Authenticates a user with email and password, creates a session,
 * and generates an OTP for two-factor authentication.
 *
 * SECURITY:
 * - Rate limited to prevent brute force attacks
 * - OTP is never exposed in the response
 * - Session cookie is httpOnly to prevent XSS
 */
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
} from '@web/server/lib/rate-limiter'
import { AuthService } from '@web/server/services/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Rate limiting - prevents brute force attacks
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit(clientIP, RATE_LIMITS.auth)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many login attempts. Please try again in ${rateLimitResult.resetInSeconds} seconds.`,
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

    const { email, password } = await request.json()
    const result = await AuthService.signIn({ email, password })

    if (result?.sessionId) {
      // Set session cookie with httpOnly: true to prevent XSS attacks
      ;(await cookies()).set('session-id', result.sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true, // SECURITY: Prevents JavaScript access to session cookie
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        domain:
          process.env.NODE_ENV === 'production'
            ? '.askremohealth.com'
            : undefined,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in signIn:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Sign in failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
