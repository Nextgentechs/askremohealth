// /api/auth/adminsignup/route.ts
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { AuthService } from '@web/server/services/auth';

const isProd = process.env.NODE_ENV === 'production';

async function setSessionCookie(sessionId: string) {
  return serialize('session-id', sessionId, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function POST(request: Request) {
  console.log('=== ADMIN SIGNUP API CALLED ===');

  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email?.trim() || !password?.trim() || !firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    console.log('All fields validated successfully');

    // Create admin
    const signupResult = await AuthService.adminSignUp({ email, password, firstName, lastName, role: 'admin' });

    // Immediately create session & generate OTP
    const signinResult = await AuthService.adminSignIn({ email, password });

    if (!signinResult?.sessionId) {
      return NextResponse.json({ success: false, message: 'Failed to create session' }, { status: 500 });
    }

    // Set cookie
    const cookie = await setSessionCookie(signinResult.sessionId);

    const res = NextResponse.json({
      success: true,
      otp: signinResult.otp,          // client can use this to show OTP form
      redirectTo: '/admin/doctors',   // redirect after OTP verification
    });
    res.headers.set('Set-Cookie', cookie);

    console.log('Admin signup + session cookie set successfully for:', email);

    return res;

  } catch (error: any) {
    console.error('Admin signup API error:', error);
    let statusCode = 400;
    let message = 'Failed to create admin account';

    if (error?.code === 'CONFLICT') {
      statusCode = 409;
      message = 'User already exists';
    }

    return NextResponse.json({ success: false, message }, { status: statusCode });
  }
}
