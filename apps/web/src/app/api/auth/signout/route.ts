import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { redisClient } from '@web/redis/redis'

export async function POST() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session-id')?.value

  if (sessionId) {
    await redisClient.del(`session:${sessionId}`)
    cookieStore.set('session-id', '', {
      path: '/',
      maxAge: 0,
    })
  }

  return NextResponse.json({ success: true })
}