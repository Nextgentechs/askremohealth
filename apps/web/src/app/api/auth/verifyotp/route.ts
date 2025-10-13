// /api/auth/verifyotp/route.ts
import { AuthService } from "@web/server/services/auth";
import { NextResponse } from "next/server";

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

    if (result.success) {
      // Create the JSON response
      const response = NextResponse.json({
        success: true,
        message: result.message,
        userId: result.userId,
        role: result.role
      });

      // Set the session cookie in the response
      response.cookies.set('session-id', result.sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined,
      });

      return response;
    }

    return NextResponse.json(result);
  } catch (error) {
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