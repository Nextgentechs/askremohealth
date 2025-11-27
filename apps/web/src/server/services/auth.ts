import { TRPCError } from '@trpc/server'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users, patients, adminUser } from '../db/schema'
import { createUserSession } from '../lib/session'
import { redisClient } from '@web/redis/redis'
import { generateOtp } from '../lib/generateOtp'

type SignUpInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'doctor' | 'admin' | 'lab' | 'patient'
}

type SignInInput = {
  email: string
  password: string
}

type UserWithLab = {
  id: string;
  role: 'doctor' | 'admin' | 'lab' | 'patient';
  email: string;
};

export class AuthService {
  // ==================== REGULAR USER AUTH ====================
  
  static async signUp({ email, password, firstName, lastName, role }: SignUpInput) {
    try {
      console.log('Regular signup for:', email, 'role:', role);

      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const insertedUsers = await db
        .insert(users)
        .values({ 
          email, 
          password: hashedPassword, 
          firstName, 
          lastName,
          role
        })
        .returning({ id: users.id });

      const userId = insertedUsers[0]?.id;
      if (!userId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user - no user ID returned',
        });
      }

      // Create role-specific records
      if (role === 'patient') {
        await db.insert(patients).values({
          id: userId,
          userId: userId,
        });
        console.log('Patient record created');
      }
      // Add doctor and lab record creation here if needed

      return { success: true, userId };
    } catch (error) {
      console.error('Error in signUp:', error)
    
      if (error instanceof TRPCError) {
        throw error;
      }
    
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create user',
      })
    }
  }
  
  static async signIn({ email, password }: SignInInput) {
    try {
      console.log('Regular signin attempt for:', email);

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        console.warn(`SignIn attempt with unknown email: ${email}`);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'SignIn attempt with unknown email',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.warn(`SignIn failed due to incorrect password for email: ${email}`);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'SignIn failed due to incorrect password for email',
        });
      }

      const sessionUser = { id: user.id, email: user.email ?? '' , role: user.role,};
      const sessionId = await createUserSession(sessionUser);

      const otp = generateOtp()
      await redisClient.set(`otp:${user.email}`, otp, {
        ex: 300,
      })

      console.log('Regular signin successful for:', email, 'role:', user.role);
      return { success: true, userId: user.id, sessionId, role: user.role, otp: otp };
    } catch (error) {
      console.log('SignIn error:', error)
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to sign in',
      });
    }
  }

  

// ==================== ADMIN-ONLY AUTH ====================
static async adminSignUp(input: SignUpInput, currentUser?: UserWithLab) {
  try {
    if (!input?.email || !input?.password || !input?.firstName || !input?.lastName) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Missing required fields' });
    }

    console.log('=== ADMIN SIGNUP (OPEN) === Creating admin:', input.email);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, input.email),
      columns: { id: true, email: true },
    });

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User already exists',
      });
    }

    // Create admin account and get userId
    const { userId } = await this.createAdminUser(input);

    // ------------------ OTP Generation ------------------
    const otp = generateOtp(); // e.g., 6-digit random code
    await redisClient.set(`otp:${input.email}`, otp, { ex: 300 }); // expires in 5 mins

    return {
      success: true,
      userId,
      message: 'Admin account created successfully. OTP has been sent to email.',
    };
  } catch (error) {
    console.error('Admin signup error:', error);
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Failed to create admin',
    });
  }
}

// ------------------ Private helper ------------------
private static async createAdminUser(input: SignUpInput) {
  const { email, password, firstName, lastName } = input;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });

  if (existing) {
    throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertedUsers = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'admin',
    })
    .returning({ id: users.id });

  const userId = insertedUsers[0]?.id;
  if (!userId) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create user - no user ID returned',
    });
  }

  // create admin record if using a separate table
  await db.insert(adminUser).values({
    id: userId,
    userId,
    permissions: [],
  });

  console.log('Admin user and record created successfully for:', email);
  return { success: true, userId };
}


// ---------------------- ADMIN SIGNIN ----------------------
static async adminSignIn({ email, password }: SignInInput) {
  try {
    if (!email || !password) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email and password required' });
    }

    console.log('AdminSignIn attempt for:', email);

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true, email: true, password: true, role: true },
    });

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    // Check admin role
    if (user.role !== 'admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not an admin. Please use regular signin.',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    // Create session (session util should enrich role if needed)
    const sessionUser = { id: user.id, email: user.email ?? '', role: 'admin' as const };
    const sessionId = await createUserSession(sessionUser);

    // Generate OTP and store in redis (lowercase 'ex')
    const otp = generateOtp();
    await redisClient.set(`otp:${user.email}`, otp, {
      ex: 300,
    });

    console.log('AdminSignIn successful for:', email);

    // IMPORTANT: service returns sessionId for server-side cookie setting.
    // Do not echo the sessionId directly in client JSON responses that reach browsers.
    return { success: true, userId: user.id, sessionId, role: user.role, otp };
  } catch (error) {
    console.error('Admin signin error:', error);
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to sign in as admin',
    });
  }
}


  // ==================== COMMON METHODS ====================

  static async verifyOtp(email: string, otp: string) {
    try {
      if (!email || !otp) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email and OTP required' });
      }

      const storedOtp = await redisClient.get(`otp:${email}`);
      if (!storedOtp || String(storedOtp) !== String(otp)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired OTP' });
      }

      // delete OTP
      await redisClient.del(`otp:${email}`);

      // find user (so we can create a session and return role/id)
      const user = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // create server-side session (createUserSession should return the session id)
      const sessionUser = { id: user.id, email: user.email ?? '' };
      const sessionId = await createUserSession(sessionUser);

      return {
        success: true,
        message: 'OTP verified',
        userId: user.id,
        role: user.role,
        sessionId,
      };
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      console.error('[verifyOtp] unexpected:', err);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'OTP verification failed' });
    }
  }

}