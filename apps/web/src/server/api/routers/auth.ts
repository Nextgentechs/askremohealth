// server/api/routers/auth.ts
import { z } from 'zod'
import { procedure, publicProcedure } from '../trpc'
import { AuthService } from '@web/server/services/auth'

export const signUp = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string(),
  }))
  .mutation(async ({ input }) => {
    return AuthService.signUp(input)
  })

export const signIn = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    return AuthService.signIn(input, ctx)
  })
