/**
 * Password Reset Request API
 *
 * Initiates the password reset flow by:
 * 1. Validating email format
 * 2. Generating a secure reset token
 * 3. Sending reset link via email
 *
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * @security Rate limited to prevent abuse
 */

import { env } from '@web/env'
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
} from '@web/server/lib/rate-limiter'
import { AuthService } from '@web/server/services/auth'
import { type NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(env.RESEND_API_KEY)

// Input validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force email enumeration
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit(
      clientIP,
      RATE_LIMITS.passwordReset,
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many reset attempts. Please try again later.',
          resetInSeconds: rateLimitResult.resetInSeconds,
        },
        { status: 429 },
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = forgotPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message },
        { status: 400 },
      )
    }

    const { email } = validation.data

    // Request password reset (generates token)
    const result = await AuthService.requestPasswordReset(email)

    // Only send email if token was generated (user exists)
    if (result.resetToken) {
      if (!env.NEXT_PUBLIC_APP_URL) {
        console.error(
          'Missing NEXT_PUBLIC_APP_URL environment variable. Cannot send password reset email.',
        )
        return NextResponse.json(
          {
            success: false,
            message: 'Server misconfiguration. Please try again later.',
          },
          { status: 500 },
        )
      }

      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${result.resetToken}`

      await resend.emails.send({
        from: 'Ask Remo Health <noreply@askremohealth.com>',
        to: email,
        subject: 'Reset Your Password - Ask Remo Health',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0070f3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .warning { background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Password Reset</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>We received a request to reset your password for your Ask Remo Health account.</p>
                  <p>Click the button below to reset your password:</p>
                  <p style="text-align: center;">
                    <a href="${resetUrl}" class="button" style="color: white;">Reset Password</a>
                  </p>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">
                    ${resetUrl}
                  </p>
                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong>
                    <ul>
                      <li>This link expires in 1 hour</li>
                      <li>If you didn't request this, please ignore this email</li>
                      <li>Never share this link with anyone</li>
                    </ul>
                  </div>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Ask Remo Health. All rights reserved.</p>
                  <p>This is an automated message, please do not reply.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    }

    // Always return success message (prevents email enumeration)
    return NextResponse.json({
      success: true,
      message:
        'If an account exists with this email, you will receive a password reset link.',
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
