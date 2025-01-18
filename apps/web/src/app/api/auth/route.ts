import { NextResponse } from 'next/server'
import { lucia } from '@web/lib/lucia'
import { db } from '@web/server/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json()

    const user = await db.query.users.findFirst({
      where: (user) => eq(user.phone, phone),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password!)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
      },
    })

    response.headers.set(
      'Set-Cookie',
      `${sessionCookie.name}=${sessionCookie.value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 180}`,
    )

    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function OPTIONS(request: Request) {
  const response = NextResponse.json({})
  response.headers.set(
    'Access-Control-Allow-Origin',
    request.headers.get('origin') ?? '*',
  )
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}
