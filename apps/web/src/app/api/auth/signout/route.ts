import { type NextRequest, NextResponse } from 'next/server'
import { signOut } from '@web/auth'

export async function POST(_request: NextRequest) {
  try {
    await signOut()
    
    // Redirect to homepage
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://askremohealth.com' 
      : 'http://localhost:3000'
    
    return NextResponse.redirect(baseUrl)
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 })
  }
}
