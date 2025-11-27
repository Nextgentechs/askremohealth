// /api/auth/verifyotp/route.ts
import { AuthService } from "@web/server/services/auth";
import { NextResponse } from "next/server";

const COOKIE_NAME = 'session-id';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1 week

export async function POST(request: Request) {
  try {
    const { otp, email } = await request.json();

    if (!otp || !email) {
      return NextResponse.json(
        { success: false, message: "OTP and email are required" },
        { status: 400 }
      );
    }

    const result = await AuthService.verifyOtp(email, otp);

    if (!result?.success || !result.sessionId || !result.role) {
      return NextResponse.json(
        { success: false, message: result?.message ?? "OTP verification failed" },
        { status: 401 }
      );
    }

    // Determine redirect URL based on role
    let redirectTo = '/';
    switch (result.role) {
      case 'admin':
        redirectTo = 'https://admin.askremohealth.com/admin/doctors';
        break;
      case 'doctor':
        redirectTo = '/specialist/upcoming-appointments';
        break;
      case 'patient':
        redirectTo = '/patient/upcoming-appointments';
        break;
      case 'lab':
        redirectTo = '/lab/dashboard';
        break;
    }

    // Set session cookie for cross-subdomain
    const response = NextResponse.json({
      success: true,
      message: result.message ?? 'OTP verified',
      role: result.role,
      redirectTo, // send redirect to frontend
    });

    response.cookies.set(COOKIE_NAME, result.sessionId, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: SESSION_MAX_AGE,
      domain: '.askremohealth.com', // important for admin subdomain
    });

    return response;

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
