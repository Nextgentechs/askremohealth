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
