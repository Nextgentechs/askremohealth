import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from './server/db' // adjust path as needed
import { users } from './server/db/schema' // adjust path as needed
import { cookies } from 'next/headers'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        domain: process.env.NODE_ENV === 'production' ? '.askremohealth.com' : '.localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    // Add other cookies as needed (callbackUrl, csrfToken, etc.)
  },
  callbacks: {
    async signIn({ user, account }) {
      // Get role from cookie or default to 'doctor'
      let role = 'doctor'
      
      try {
        const cookieStore = await cookies()
        const roleCookie = cookieStore.get('signup-role')
        if (roleCookie?.value && ['doctor', 'patient', 'admin'].includes(roleCookie.value)) {
          role = roleCookie.value
          // console.log("role", role)
          // Clear the cookie after using it
          cookieStore.set('signup-role', '', { maxAge: 0 })
        }
      } catch (error) {
        console.log('Error reading role cookie:', error)
      }

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, user.email ?? ''),
      })

      if (!existingUser) {
        // Insert the new user into the users table
        await db.insert(users).values({
          email: user.email ?? '',
          firstName: user.name?.split(' ')[0] ?? '',
          lastName: user.name?.split(' ').slice(1).join(' ') ?? '',
          role: role as 'doctor' | 'patient' | 'admin',
          password: '',
        })
      }

      return true
    },
    async redirect({ baseUrl }) {
      // Always redirect to a specific page after sign-in
      return `${baseUrl}/specialist/onboarding/personal-details` // or any URL you want
    },
  },
})
