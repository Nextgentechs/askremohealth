import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sessionSchema } from '@web/server/lib/session'
import { redisClient } from '@web/redis/redis'
import { db } from '@web/server/db'
import { users } from '@web/server/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session-id')?.value
  console.log('sessionId:', sessionId)
  if (!sessionId) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const rawSession = await redisClient.get(`session:${sessionId}`)
  console.log('rawSession:', rawSession)
  if (!rawSession) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  let parsedSession
  try {
    parsedSession = sessionSchema.safeParse(
      typeof rawSession === 'string' ? JSON.parse(rawSession) : rawSession
    )
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  if (!parsedSession.success) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  // Query the full user details from the database using the id from the session
  const user = await db.query.users.findFirst({
    where: eq(users.id, parsedSession.data.id),
  })

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user })
}