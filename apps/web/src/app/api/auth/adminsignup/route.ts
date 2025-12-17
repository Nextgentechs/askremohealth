// /api/auth/adminsignup/route.ts
import { AuthService } from '@web/server/services/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('=== ADMIN SIGNUP API CALLED ===')

  try {
    const body = await request.json()
    console.log('Request body:', body)

    const { email, password, firstName, lastName } = body

    // Validate required fields
    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 },
      )
    }
    if (!password?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 },
      )
    }
    if (!firstName?.trim()) {
      return NextResponse.json(
        { success: false, message: 'First name is required' },
        { status: 400 },
      )
    }
    if (!lastName?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Last name is required' },
        { status: 400 },
      )
    }

    console.log('All fields validated successfully')

    // Call AuthService without session checking
    const result = await AuthService.adminSignUp({
      email,
      password,
      firstName,
      lastName,
    })

    console.log('Admin signup successful for:', email)
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Admin signup API error:', error)

    let statusCode = 400
    let message = 'Failed to create admin account'

    if (error instanceof Error) {
      message = error.message
      const errorWithCode = error as { code?: string }
      if (errorWithCode.code === 'CONFLICT') {
        statusCode = 409
        message = 'User already exists'
      } else if (errorWithCode.code === 'FORBIDDEN') {
        statusCode = 403
      }
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: statusCode },
    )
  }
}
