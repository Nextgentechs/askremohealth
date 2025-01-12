import { env } from '@web/env'
import { type InferSelectModel } from 'drizzle-orm'
import { SignJWT } from 'jose'
import { type users } from '../db/schema'
import { jwtVerify } from 'jose'

export class Auth {
  static async sign({
    payload,
    sub,
    exp,
  }: {
    payload: InferSelectModel<typeof users>
    sub: string
    exp: string
  }) {
    const token = new SignJWT(payload)
      .setAudience('https://www.askvirtualhealthcare.com/')
      .setIssuer('https://www.askvirtualhealthcare.com/')
      .setSubject(sub)
      .setIssuedAt()
      .setExpirationTime(exp)
      .setProtectedHeader({ alg: 'HS256' })

    return await token.sign(new TextEncoder().encode(env.JWT_SECRET))
  }

  static async createAuthorizationToken(
    payload: InferSelectModel<typeof users>,
  ) {
    return {
      accessToken: await this.sign({
        payload,
        sub: payload.id,
        exp: '10 minutes',
      }),
      refreshToken: await this.sign({
        payload,
        sub: payload.id,
        exp: '30 days',
      }),
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const secret = new TextEncoder().encode(env.JWT_SECRET)
      const payload = await jwtVerify(refreshToken, secret, {
        algorithms: ['HS256'],
      })

      return {
        accessToken: await this.sign({
          payload: payload.payload as InferSelectModel<typeof users>,
          sub: payload.payload.id as string,
          exp: '10 minutes',
        }),
        refreshToken,
      }
    } catch (error) {
      console.error(error)
      throw new Error('Invalid refresh token')
    }
  }
}
