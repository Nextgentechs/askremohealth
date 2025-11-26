// /api/auth/adminsignin.ts or adminsignup.ts
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { AuthService } from '@web/server/services/auth';

const isProd = process.env.NODE_ENV === 'production';

async function setSessionCookie(sessionId: string) {
  return serialize('session-id', sessionId, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax', // safe for same domain
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Call your AuthService to sign in (or signup)
    const result = await AuthService.adminSignIn({ email, password });

    if (!result?.sessionId) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 400 });
    }

    const cookie = await setSessionCookie(result.sessionId);

    const res = NextResponse.json({
      success: true,
      redirectTo: '/admin/doctors', // frontend uses this after OTP
      otp: result.otp, // if OTP needed
    });

    res.headers.set('Set-Cookie', cookie);
    return res;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
