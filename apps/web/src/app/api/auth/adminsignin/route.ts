import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { AuthService } from '@web/server/services/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const result = await AuthService.adminSignIn({ email, password });

    if (result?.sessionId) {
      const isProd = process.env.NODE_ENV === 'production';
  
      const cookie = serialize('session-id', result.sessionId, {
        httpOnly: true,
        secure: isProd,                  // only require secure in production
        sameSite: isProd ? 'none' : 'lax', 
        path: '/',
        domain: isProd ? '.askremohealth.com' : undefined, // undefined allows localhost/staging
        maxAge: 60 * 60 * 24 * 7,
      });
      const res = NextResponse.json({ success: true });
      res.headers.set('Set-Cookie', cookie);
      return res;
    }

    return NextResponse.json({ success: false }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'failed' }, { status: 500 });
  }
}
