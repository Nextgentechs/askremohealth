// /api/auth/verifyotp/route.ts
import { AuthService } from "@web/server/services/auth";
import { NextResponse } from "next/server";

const COOKIE_NAME = 'session-id';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // one week

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { otp, email } = body;

    if (!otp || !email) {
      return NextResponse.json(
        { success: false, message: "OTP and email are required" },
        { status: 400 }
      );
    }

    const result = await AuthService.verifyOtp(email, otp);

    if (result?.success) {
      // ensure verifyOtp returned a sessionId
      if (!result.sessionId) {
        console.error('verifyOtp succeeded but no sessionId returned for', email);
        return NextResponse.json({ success: false, message: 'No session created' }, { status: 500 });
      }

      // Build JSON response WITHOUT exposing sessionId
      const response = NextResponse.json({
        success: true,
        message: result.message ?? 'OTP verified',
        userId: result.userId,
        role: result.role
      });

      // Set cookie - HttpOnly and SameSite=None in production for cross-subdomain
      response.cookies.set(COOKIE_NAME, result.sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true, // important for security
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: SESSION_MAX_AGE,
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined,
      });

      return response;
    }

    // verification failed (result may contain message)
    return NextResponse.json(result, { status: 401 });
  } catch (error) {
    console.error('verifyotp error', error);
    return NextResponse.json(
      {
        success: false,
        message: "OTP verification failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
