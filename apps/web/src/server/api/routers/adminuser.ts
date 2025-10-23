import { z } from 'zod'
import { protectedProcedure, publicProcedure } from '../trpc'
import { db } from '@web/server/db'
import { users, adminUser } from '@web/server/db/schema'
import { eq } from 'drizzle-orm'
import { adminSchema } from '@web/server/api/validators'

/*---------------------- Update Admin -------------------------- */
export const updateAdminDetails = protectedProcedure
  .input(adminSchema)
  .mutation(async ({ input, ctx }) => {
    await db
      .update(users)
      .set({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        role: input.role,
      })
      .where(eq(users.id, ctx.user.id!))

    await db
      .update(adminUser)
      .set({
        phone: input.phone ?? null,
        onboardingComplete: input.onboardingComplete ?? false,
        permissions: input.permissions ?? [],
      })
      .where(eq(adminUser.userId, ctx.user.id!))

    return { success: true, message: 'Admin updated successfully' }
  })

/* -------------------------- Get Current Admin -------------------------- */
export const getCurrentAdmin = protectedProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null

  const admin_user = await db.query.adminUser.findFirst({
    where: (adminUser, { eq }) => eq(adminUser.userId, ctx.user.id),
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  })

  if (!admin_user) return null

  return {
    firstName: admin_user.user?.firstName ?? '',
    lastName: admin_user.user?.lastName ?? '',
    email: admin_user.user?.email ?? '',
    role: admin_user.user?.role ?? '',
    phone: admin_user.phone ?? '',
    onboardingComplete: admin_user.onboardingComplete ?? false,
    permissions: admin_user.permissions ?? [],
  }
})

/* -------------------------- Delete Admin -------------------------- */
export const deleteAdmin = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can delete other admins')
    }

    await db.delete(adminUser).where(eq(adminUser.userId, input.id))
    await db.delete(users).where(eq(users.id, input.id))

    return { success: true, message: 'Admin deleted successfully' }
  })

/* -------------------------- Export Router -------------------------- */
export const adminRouter = { 
  updateAdminDetails,
  getCurrentAdmin, 
  deleteAdmin,
}
