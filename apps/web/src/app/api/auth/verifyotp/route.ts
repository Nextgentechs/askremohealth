import { AuthService } from "@web/server/services/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { otp, email, userType } = body; // Add userType to specify the user role

    if (!otp || !email) {
      return NextResponse.json(
        { success: false, message: "OTP and email are required" },
        { status: 400 }
      );
    }

    const result = await AuthService.verifyOtp(email, otp);

    if (result.success) {
      // Create session after successful OTP verification
      const sessionId = await createUserSession(email, userType);
      
      // Determine redirect URL based on userType
      let finalRedirectTo = '/'; // Default fallback to home
      
      if (userType === 'admin') {
        finalRedirectTo = '/admin/doctors';
      } else if (userType === 'doctor') {
        finalRedirectTo = '/specialist/upcoming-appointments';
      } else if (userType === 'patient') {
        finalRedirectTo = '/patient/dashboard'; // or whatever patient route you have
      }
      // Add more user types as needed
      
      console.log(`OTP verified for ${userType}, redirecting to: ${finalRedirectTo}`);
      
      // Return JSON response with redirect info
      const response = NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
        redirectTo: finalRedirectTo,
        userType: userType
      });
      
      // Set session cookie in the response
      response.cookies.set('session-id', sessionId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : undefined,
      });
      
      return response;
    }

    // If OTP verification failed, return error response
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

// Mock session creation - replace with your actual implementation
async function createUserSession(email: string, userType: string): Promise<string> {
  // Your actual session creation logic here
  // Include userType in the session data if needed
  return `session-${userType}-${email}-${Date.now()}`;
}