import { NextResponse } from 'next/server';
import { AuthService } from '@web/server/services/auth';
import { getAdminSessionById } from '@web/server/lib/session';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // Optional: check session for existing admin
    const sessionId = request.headers.get('session-id');
    const currentUser = await getAdminSessionById(sessionId ?? '');

    const result = await AuthService.adminSignUp(
      { email, password, firstName, lastName, role: 'admin' },
      currentUser ?? undefined
    );

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Admin signup error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to create admin' },
      { status: 400 }
    );
  }
}
