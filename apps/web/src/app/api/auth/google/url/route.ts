import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@web/auth'

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json()
    
    if (!role || !['doctor', 'patient', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' }, 
        { status: 400 }
      )
    }

    const authUrl = getGoogleAuthUrl(role)
    
    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate OAuth URL' }, 
      { status: 500 }
    )
  }
} 