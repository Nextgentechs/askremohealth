import { TRPCError } from '@trpc/server'
import { doctors,notifications, type subSpecialties } from '@web/server/db/schema'
import { count, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { adminProcedure } from '../trpc'

export const getDoctors = adminProcedure
  .input(
    z.object({ page: z.number().default(1), limit: z.number().default(10) }),
  )
  .query(async ({ ctx, input }) => {
    try {
      const [total, data] = await Promise.all([
        ctx.db.select({ count: count() }).from(doctors),
        ctx.db.query.doctors.findMany({
          offset: Math.max(0, (input.page - 1) * input.limit), // Changed offset to start at 0
          limit: input.limit,
          with: {
            user: {
              columns: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: (doctors, { desc }) => [
            desc(
              sql<number>`CASE 
                WHEN ${doctors.status} = 'pending' THEN 3
                WHEN ${doctors.status} = 'verified' THEN 2
                WHEN ${doctors.status} = 'rejected' THEN 1
                ELSE 0 
              END`,
            ),
            desc(doctors.createdAt),
          ],
        }),
      ])

      return {
        pagination: {
          total: total[0]?.count ?? 0,
          pages: Math.ceil((total[0]?.count ?? 0) / input.limit),
        },
        data,
      }
    } catch (error) {
      console.error('Error in getDoctors procedure:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch doctors',
        cause: error,
      })
    }
  })


export const getDoctor = adminProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const doctor = await ctx.db.query.doctors.findFirst({
      where: (doctor, { eq }) => eq(doctor.id, input.id),
      with: {
        certificates: true,
        specialty: true,
        facility: true,
        operatingHours: true,
        profilePicture: true,
        user: {
          columns: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!doctor) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Doctor not found',
      })
    }

    const subspecialtyIds = (
      doctor.subSpecialties as Array<{ id: string }>
    ).map((sub) => sub.id)
    let subspecialties: (typeof subSpecialties.$inferSelect)[] = []

    if (subspecialtyIds.length > 0) {
      subspecialties = await ctx.db.query.subSpecialties.findMany({
        where: (subspecialty, { inArray }) =>
          inArray(subspecialty.id, subspecialtyIds),
      })
    }

    return {
      ...doctor,
      subSpecialties: subspecialties,
    }
  })

export const updateDoctorStatus = adminProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'verified', 'rejected']),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { id, status } = input

    // Fetch doctor to get the userId for notification
    const doc = await ctx.db.query.doctors.findFirst({
      where: (d, { eq }) => eq(d.id, id),
      columns: { userId: true },
    })

    if (!doc) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Doctor not found' })
    }

    // Update doctor status
    await ctx.db.update(doctors).set({ status }).where(eq(doctors.id, id))

    // Notify the doctor
    await ctx.db.insert(notifications).values({
      userId: doc.userId,
      title:
        status === 'verified'
          ? 'Verification approved'
          : status === 'rejected'
          ? 'Verification rejected'
          : 'Verification pending',
      message:
        status === 'verified'
          ? 'Your profile is now visible to patients.'
          : status === 'rejected'
          ? 'Your verification was rejected. Please update your documents and resubmit.'
          : 'Your documents were received and are under review.',
    })

    return { success: true }
  })
