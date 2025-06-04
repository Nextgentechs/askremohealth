import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from './server/db' // adjust path as needed
import { users } from './server/db/schema' // adjust path as needed

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user, account }) {
      // Extract role from the callbackUrl if present
      const role = typeof account?.callback_url === 'string' && account.callback_url.includes('role=patient') 
        ? 'patient' 
        : 'doctor'

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, user.email ?? ''),
      })

      if (!existingUser) {
        // Insert the new user into the users table
        await db.insert(users).values({
          email: user.email ?? '',
          firstName: user.name?.split(' ')[0] ?? '',
          lastName: user.name?.split(' ').slice(1).join(' ') ?? '',
          role,
          password: '',
        })
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to a specific page after sign-in
      return `${baseUrl}/specialist/onboarding/personal-details` // or any URL you want
    },
  },
})
