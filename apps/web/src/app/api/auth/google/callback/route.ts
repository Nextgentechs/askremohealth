import { type NextRequest, NextResponse } from 'next/server'
import { handleGoogleCallback } from '@web/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/auth?error=Missing authorization code or state', request.url)
    )
  }

  try {
    const result = await handleGoogleCallback(code, state)
    
    if (!result.success || !result.user) {
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(result.error ?? 'An unknown error occurred')}`, request.url)
      )
    }

    if (result.callbackUrl) {
      return NextResponse.redirect(new URL(result.callbackUrl, request.url))
    }
    // Redirect based on user role and onboarding status
    let redirectPath = '/'

    if (result.user.role === 'doctor') {
      if (result.user.onboardingComplete) {
        redirectPath = '/specialist/upcoming-appointments'
      } else {
        redirectPath = '/specialist/onboarding/personal-details'
      }
    } else if (result.user.role === 'patient') {
      if (result.user.onboardingComplete) {
        redirectPath = '/patient/upcoming-appointments'
      } else {
        redirectPath = '/patient/onboarding/patient-details'
      }
    } else if (result.user.role === 'admin') {
      redirectPath = '/admin'
    }

    // Determine the correct domain for redirect
    let redirectUrl: string
    if (process.env.NODE_ENV === 'production') {
      if (result.user.role === 'doctor') {
        redirectUrl = `https://doctors.askremohealth.com${redirectPath}`
      } else {
        redirectUrl = `https://askremohealth.com${redirectPath}`
      }
    } else {
      if (result.user.role === 'doctor') {
        redirectUrl = `http://doctors.localhost:3000${redirectPath}`
      } else {
        redirectUrl = `http://localhost:3000${redirectPath}`
      }
    }

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(
      new URL('/auth?error=Authentication failed', request.url)
    )
  }
}
