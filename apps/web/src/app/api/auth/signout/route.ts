import { type NextRequest, NextResponse } from 'next/server'
import { signOut } from '@web/auth'

export async function POST(_request: NextRequest) {
  try {
    await signOut()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 })
  }
}
