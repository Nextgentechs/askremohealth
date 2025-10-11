import { NextResponse } from 'next/server'
import { AuthService } from '@web/server/services/auth'

export async function POST(request: Request): Promise<Response> {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Get host from headers to infer role
    const host = request.headers.get('host') ?? ''

    const result = await AuthService.signUp({
      email,
      password,
      firstName,
      lastName,      
    }, host)
   
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in signUp:', error)
    return NextResponse.json(
      { success: false, message: 'Sign up failed', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
