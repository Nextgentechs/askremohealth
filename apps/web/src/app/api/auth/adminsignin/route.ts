import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'
import { AuthService } from '@web/server/services/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const result = await AuthService.adminSignIn({ email, password });

    if (result?.sessionId) {
      // create cookie string with domain set for all subdomains
      (await cookies()).set('session-id', result.sessionId, {
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: false,
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7,
            })
      
    }

    return NextResponse.json(result)
  } catch (error) {
      console.error('Error in signIn:', error)
      return NextResponse.json(
        { success: false, message: 'Sign in failed', error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    } 
}
