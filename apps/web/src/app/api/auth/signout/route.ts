import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { redisClient } from '@web/redis/redis'
import { auth } from '@web/auth'

export async function POST() {
  try {
    const session = await auth()

    // console.log(session)
    
    if (session) {
      const cookieStore = await cookies()
      
      cookieStore.set('authjs.session-token', '', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 0,
        expires: new Date(0),
      })
      cookieStore.set('__Secure-authjs.session-token', '', {
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 0,
        expires: new Date(0),
      })
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session-id')?.value

    if (sessionId) {
      await redisClient.del(`session:${sessionId}`)
    }

    cookieStore.set('session-id', '', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in signOut:', error)

    const cookieStore = await cookies()
    
    cookieStore.set('session-id', '', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
    })
    
    cookieStore.set('authjs.session-token', '', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
    })
    
    cookieStore.set('__Secure-authjs.session-token', '', {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
    })
    
    return NextResponse.json({ 
      success: true,
      warning: 'Some cleanup operations may have failed'
    })
  }
}