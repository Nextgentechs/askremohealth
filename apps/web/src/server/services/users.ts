import { type InferInsertModel } from 'drizzle-orm'
import { users } from '../db/schema'
import { db } from '../db'
import { TRPCError } from '@trpc/server'

export class User {
  static async createUser(params: InferInsertModel<typeof users>) {
    const [user] = await db
      .insert(users)
      .values({
        ...params,
      })
      .returning()

    if (!user) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Failed to create user',
      })
    }

    return user
  }
}
