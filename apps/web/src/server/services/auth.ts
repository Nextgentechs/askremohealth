// server/services/auth.ts
import { db } from "../db";
import { TRPCError } from "@trpc/server";
import bcrypt from 'bcrypt'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createUserSession } from "../lib/session";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

type Context = {
  req: NextApiRequest
  res: NextApiResponse
  cookies: {
    set: (
      key: string,
      value: string,
      options: {
        secure?: boolean
        httpOnly?: boolean
        sameSite?: "strict" | "lax"
        expires?: number
      }
    ) => void
  }
}

type SignUpInput = {
  email: string
  password: string
  firstName: string
  lastName: string
}

type SignInInput = {
  email: string;
  password: string;
};

export class AuthService {

static async signUp({ email, password, firstName, lastName }: SignUpInput) {
  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });


    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({ email, password: hashedPassword, firstName, lastName });

    return { success: true };
  } catch (error) {
    console.error('Error in signUp:', error);
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' });
  }
}

static async signIn({ email, password }: SignInInput, ctx: Context) {
  try {
    const user = await db.query.users.findFirst({
      where: { email }
    });

    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    const sessionUser = { id: user.id, email: user.email };
    const sessionToken = await createUserSession(sessionUser, ctx.cookies);

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Error in signIn:', error);
    // If it's already a TRPCError, rethrow it
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to sign in' });
  }
}

}
