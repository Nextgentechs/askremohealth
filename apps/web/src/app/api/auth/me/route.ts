import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@web/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json({ user: null })
  }
}