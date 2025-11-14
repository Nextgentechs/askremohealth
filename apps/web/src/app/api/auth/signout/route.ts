import { type NextRequest, NextResponse } from 'next/server'
import { signOut as signOutAuth } from '@web/auth'

export async function POST(_request: NextRequest) {
  try {
    const response = await signOutAuth() // signOut internally calls `cookies()`
    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 })
  }
}

