/**
 * Reviews Router
 *
 * Handles patient reviews for doctors after completed appointments
 */

import { TRPCError } from '@trpc/server'
import { db } from '@web/server/db'
import {
  appointments,
  doctors,
  patients,
  reviews,
  users,
} from '@web/server/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { createTRPCRouter, procedure, publicProcedure } from '../trpc'
import { AppointmentStatus } from '../validators'

export const reviewsRouter = createTRPCRouter({
  /**
   * Submit a review for a completed appointment
   * Only patients can submit reviews, and only for their own completed appointments
   */
  create: procedure
    .input(
      z.object({
        appointmentId: z.string().uuid(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { appointmentId, rating, comment } = input

      // Get patient ID from user
      const patient = await db.query.patients.findFirst({
        where: eq(patients.userId, ctx.user.id),
        columns: { id: true },
      })

      const patientId = patient?.id

      if (!patientId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Patient profile not found',
        })
      }

      // Verify the appointment exists and belongs to this patient
      const appointment = await db.query.appointments.findFirst({
        where: and(
          eq(appointments.id, appointmentId),
          eq(appointments.patientId, patientId),
        ),
      })

      if (!appointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        })
      }

      // Verify appointment is completed
      if (appointment.status !== AppointmentStatus.Completed) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only review completed appointments',
        })
      }

      // Check if review already exists
      const existingReview = await db.query.reviews.findFirst({
        where: eq(reviews.appointmentId, appointmentId),
      })

      if (existingReview) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You have already reviewed this appointment',
        })
      }

      // Create the review
      const [review] = await db
        .insert(reviews)
        .values({
          appointmentId,
          doctorId: appointment.doctorId,
          patientId,
          rating,
          comment: comment ?? null,
        })
        .returning()

      return {
        success: true,
        review,
      }
    }),

  /**
   * Get reviews for a specific doctor
   */
  getByDoctor: publicProcedure
    .input(
      z.object({
        doctorId: z.string(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      const { doctorId, limit, offset } = input

      const doctorReviews = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          patientFirstName: users.firstName,
          patientLastName: users.lastName,
        })
        .from(reviews)
        .leftJoin(patients, eq(reviews.patientId, patients.id))
        .leftJoin(users, eq(patients.userId, users.id))
        .where(eq(reviews.doctorId, doctorId))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset)

      return doctorReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        patientName: review.patientFirstName
          ? `${review.patientFirstName} ${review.patientLastName?.charAt(0) ?? ''}.`
          : 'Anonymous',
      }))
    }),

  /**
   * Check if patient has already reviewed an appointment
   */
  hasReviewed: procedure
    .input(z.object({ appointmentId: z.string().uuid() }))
    .query(async ({ input }) => {
      const existingReview = await db.query.reviews.findFirst({
        where: eq(reviews.appointmentId, input.appointmentId),
      })

      return { hasReviewed: !!existingReview }
    }),

  /**
   * Get patient's own reviews
   */
  getMyReviews: procedure.query(async ({ ctx }) => {
    // Get patient ID from user
    const patient = await db.query.patients.findFirst({
      where: eq(patients.userId, ctx.user.id),
      columns: { id: true },
    })

    const patientId = patient?.id

    if (!patientId) {
      return []
    }

    const myReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        appointmentDate: appointments.appointmentDate,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
      })
      .from(reviews)
      .leftJoin(appointments, eq(reviews.appointmentId, appointments.id))
      .leftJoin(doctors, eq(reviews.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(eq(reviews.patientId, patientId))
      .orderBy(desc(reviews.createdAt))

    return myReviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      appointmentDate: review.appointmentDate,
      doctorName: review.doctorFirstName
        ? `Dr. ${review.doctorFirstName} ${review.doctorLastName}`
        : 'Doctor',
    }))
  }),
})
