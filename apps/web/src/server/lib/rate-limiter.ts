/**
 * Rate Limiter Utility
 *
 * Provides rate limiting functionality for API endpoints to prevent abuse.
 * Uses Redis for distributed rate limiting across multiple instances.
 *
 * @module server/lib/rate-limiter
 */

import { redisClient } from '@web/redis/redis'

/**
 * Rate limiter configuration options
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
  /** Prefix for Redis keys */
  keyPrefix: string
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Number of remaining requests in the current window */
  remaining: number
  /** Time in seconds until the rate limit resets */
  resetInSeconds: number
  /** Total limit for the window */
  limit: number
}

/**
 * Default rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  /** Authentication endpoints (signin, signup, OTP) - stricter limits */
  auth: {
    maxRequests: 5,
    windowSeconds: 60, // 5 requests per minute
    keyPrefix: 'ratelimit:auth',
  },
  /** OTP verification - very strict to prevent brute force */
  otp: {
    maxRequests: 3,
    windowSeconds: 60, // 3 attempts per minute
    keyPrefix: 'ratelimit:otp',
  },
  /** OTP resend - prevent spam */
  otpResend: {
    maxRequests: 3,
    windowSeconds: 300, // 3 resends per 5 minutes
    keyPrefix: 'ratelimit:otp-resend',
  },
  /** Password reset requests */
  passwordReset: {
    maxRequests: 3,
    windowSeconds: 300, // 3 requests per 5 minutes
    keyPrefix: 'ratelimit:password-reset',
  },
  /** General API endpoints - more lenient */
  api: {
    maxRequests: 100,
    windowSeconds: 60, // 100 requests per minute
    keyPrefix: 'ratelimit:api',
  },
  /** Appointment creation - prevent spam booking */
  appointment: {
    maxRequests: 10,
    windowSeconds: 60, // 10 appointments per minute
    keyPrefix: 'ratelimit:appointment',
  },
} as const satisfies Record<string, RateLimitConfig>

/**
 * Check and update rate limit for an identifier
 *
 * Uses a sliding window algorithm with Redis INCR and EXPIRE.
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID, email)
 * @param config - Rate limit configuration
 * @returns Rate limit result indicating if request is allowed
 *
 * @example
 * ```typescript
 * const result = await checkRateLimit(userEmail, RATE_LIMITS.auth)
 * if (!result.allowed) {
 *   return { error: 'Too many requests. Try again later.' }
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${identifier}`

  try {
    // Get current count
    const currentCount = (await redisClient.get<number>(key)) ?? 0

    if (currentCount >= config.maxRequests) {
      // Get TTL for reset time
      const ttl = await redisClient.ttl(key)
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: ttl > 0 ? ttl : config.windowSeconds,
        limit: config.maxRequests,
      }
    }

    // Increment counter
    const newCount = await redisClient.incr(key)

    // Set expiry only on first request (when count is 1)
    if (newCount === 1) {
      await redisClient.expire(key, config.windowSeconds)
    }

    // Get TTL for reset time
    const ttl = await redisClient.ttl(key)

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - newCount),
      resetInSeconds: ttl > 0 ? ttl : config.windowSeconds,
      limit: config.maxRequests,
    }
  } catch (error) {
    // If Redis fails, allow the request but log the error
    console.error('Rate limiter error:', error)
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetInSeconds: config.windowSeconds,
      limit: config.maxRequests,
    }
  }
}

/**
 * Clear rate limit for an identifier
 * Useful for resetting after successful actions like email verification
 *
 * @param identifier - Unique identifier
 * @param config - Rate limit configuration
 */
export async function clearRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<void> {
  const key = `${config.keyPrefix}:${identifier}`
  try {
    await redisClient.del(key)
  } catch (error) {
    console.error('Error clearing rate limit:', error)
  }
}

/**
 * Get client IP address from request headers
 * Handles various proxy configurations (Vercel, Cloudflare, etc.)
 *
 * @param request - The incoming request
 * @returns IP address string
 */
export function getClientIP(request: Request): string {
  // Check various headers in order of preference
  const headers = new Headers(request.headers)

  // Vercel / Cloudflare
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown'
  }

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Vercel
  const vercelForwardedFor = headers.get('x-vercel-forwarded-for')
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0]?.trim() ?? 'unknown'
  }

  // Real IP header (nginx)
  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}
