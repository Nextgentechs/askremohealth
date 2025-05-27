// server/api/routers/auth.ts
import { AuthService } from '@web/server/services/auth'
import { z } from 'zod'
import { publicProcedure } from '../trpc'

// export const signUp = publicProcedure
//   .input(
//     z.object({
//       email: z.string().email(),
//       password: z.string().min(6),
//       firstName: z.string(),
//       lastName: z.string(),
//     }),
//   )
//   .mutation(async ({ input }) => {
//     console.log('SignUp data being passed:', input)
//     return AuthService.signUp(input)
//   })

// export const signIn = publicProcedure
//   .input(
//     z.object({
//       email: z.string().email(),
//       password: z.string(),
//     }),
//   )
//   .mutation(async ({ input, ctx }) => {
//     try {
//       const result = await AuthService.signIn(input, ctx)
//       console.log('SignIn Result:', result)
//       return result
//     } catch (err) {
//       console.error('Error in signIn:', err)
//       throw err
//     }
//   })