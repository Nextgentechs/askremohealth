// app/api/auth/adminsignin/route.ts  (or pages/api/auth/adminsignin.ts)
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@web/server/services/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const result = await AuthService.adminSignIn({ email, password });

    if (result?.sessionId) {
      // set cookie on the outgoing response
      (await cookies()).set('session-id', result.sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,           // secure server-only cookie
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // server redirect to admin doctors
    const redirectUrl = new URL('/admin/doctors', request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error: unknown) {
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
