import { NextResponse } from 'next/server';
import { AuthService } from '@web/server/services/auth';
import { getAdminSessionById } from '@web/server/lib/session';

export async function POST(request: Request) {
  console.log('=== ADMIN SIGNUP API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { email, password, firstName, lastName } = body;

    // Validate required fields
    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    if (!password?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }
    if (!firstName?.trim()) {
      return NextResponse.json(
        { success: false, message: 'First name is required' },
        { status: 400 }
      );
    }
    if (!lastName?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Last name is required' },
        { status: 400 }
      );
    }

    console.log('All fields validated successfully');

    // Get session for authorization
    const sessionId = request.headers.get('session-id') || 
                     request.headers.get('cookie')?.match(/session-id=([^;]+)/)?.[1];
    console.log('Session ID:', sessionId);

    let currentUser = undefined;
    if (sessionId) {
      currentUser = await getAdminSessionById(sessionId);
      console.log('Current admin user from session:', currentUser);
    } else {
      console.log('No session ID provided - this might be first admin creation');
    }

    const result = await AuthService.adminSignUp(
      { email, password, firstName, lastName, role: 'admin' },
      currentUser ?? undefined
    );

    console.log('Admin signup successful for:', email);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Admin signup API error:', error);
    
    let statusCode = 400;
    let message = error?.message || 'Failed to create admin account';

    if (error?.code === 'CONFLICT') {
      statusCode = 409;
      message = 'User already exists';
    } else if (error?.code === 'FORBIDDEN') {
      statusCode = 403;
      message = 'Only existing admins can create new admin accounts';
    }

    return NextResponse.json(
      { 
        success: false, 
        message,
        code: error?.code
      },
      { status: statusCode }
    );
  }
}