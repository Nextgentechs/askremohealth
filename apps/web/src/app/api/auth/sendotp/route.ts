/**
 * Send OTP Email Endpoint
 *
 * SECURITY: This endpoint fetches the OTP directly from Redis rather than
 * receiving it from the client. This prevents any possibility of OTP manipulation
 * or exposure through the API response.
 *
 * Flow:
 * 1. Client provides only the email address
 * 2. Server fetches OTP from Redis (stored during signin)
 * 3. Server sends email with OTP
 * 4. Client never sees or handles the OTP value
 *
 * RATE LIMITING: Prevents OTP spam (3 resends per 5 minutes)
 */
import { EmailTemplate } from '@web/components/email-template'
import { redisClient } from '@web/redis/redis'
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
} from '@web/server/lib/rate-limiter'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { env } from 'src/env'

export async function POST(req: Request) {
  const body = await req.json()
  const { email } = body

  // Validate email is provided
  if (!email || typeof email !== 'string') {
    return NextResponse.json(
      { error: { message: 'Email is required' } },
      { status: 400 },
    )
  }

  // Rate limiting - prevents OTP spam
  const clientIP = getClientIP(req)
  const rateLimitResult = await checkRateLimit(
    `${clientIP}:${email}`, // Rate limit by IP + email combination
    RATE_LIMITS.otpResend,
  )

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: {
          message: `Too many OTP requests. Please try again in ${rateLimitResult.resetInSeconds} seconds.`,
        },
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

  // SECURITY: Use server-side API key, not client-exposed key
  const resend = new Resend(env.RESEND_API_KEY)

  try {
    // SECURITY: Fetch OTP from Redis instead of receiving from client
    // This prevents OTP from ever being exposed to the client
    const otp = await redisClient.get(`otp:${email}`)

    if (!otp) {
      return NextResponse.json(
        {
          error: {
            message: 'No pending OTP found. Please try signing in again.',
          },
        },
        { status: 400 },
      )
    }

    // Send the OTP via email - otp is guaranteed to be a string from Redis
    const otpString = typeof otp === 'string' ? otp : JSON.stringify(otp)
    const data = await resend.emails.send({
      from: 'info@askremohealth.com',
      to: email,
      subject: 'Your One-Time Password (OTP) - Ask Remo Health',
      react: EmailTemplate({ otp: otpString }),
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return NextResponse.json(
      { error: { message: 'Failed to send OTP email. Please try again.' } },
      { status: 500 },
    )
  }
}
