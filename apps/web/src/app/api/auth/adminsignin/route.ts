import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@web/server/services/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Admin-specific sign-in
    const result = await AuthService.adminSignIn({ email, password });

    // Set session cookie if sessionId exists
    if (result?.sessionId) {
      (await cookies()).set('session-id', result.sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return NextResponse.json({
      ...result,
      success: true,
      message: 'Admin signed in successfully',      
    });
  } catch (error: any) {
    console.error('Error in adminSignIn:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Admin sign in failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }
}
