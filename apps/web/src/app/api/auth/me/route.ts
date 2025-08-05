import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@web/auth'

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(user)
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
