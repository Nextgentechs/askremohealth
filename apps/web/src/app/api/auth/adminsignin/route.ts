import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { AuthService } from '@web/server/services/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const result = await AuthService.adminSignIn({ email, password });

    if (result?.sessionId) {
      // create cookie string with domain set for all subdomains
      const cookie = serialize('session-id', result.sessionId, {
        httpOnly: true,
        secure: true,                // required when SameSite=None
        sameSite: 'none',
        path: '/',
        domain: '.askremohealth.com', // NOTE leading dot
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
