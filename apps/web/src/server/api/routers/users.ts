/**
 * Users Router
 *
 * Handles user-related tRPC procedures including:
 * - Current user retrieval
 * - Appointment management (create, list, cancel, reschedule)
 *
 * @module server/api/routers/users
 */
import { TRPCError } from '@trpc/server'
import { db } from '@web/server/db'
import { appointmentLogs, appointments, patients } from '@web/server/db/schema'
import {
  checkDuplicateAppointment,
  validateAppointmentSlot,
  validateReschedule,
} from '@web/server/services/appointment-validation'
import { User } from '@web/server/services/users'
import { AppointmentStatus } from '@web/server/utils'
import { z } from 'zod'
import { procedure, publicProcedure } from '../trpc'
import { appointmentListSchema, newAppointmentSchema } from '../validators'

/**
 * Get current user with role-specific details
 */
export const currentUser = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null

  // Get additional details based on role
  if (ctx.user.role === 'doctor') {
    const doctorDetails = await db.query.doctors.findFirst({
      where: (doctor, { eq }) => eq(doctor.userId, ctx.user?.id ?? ''),
      columns: {
        phone: true,
      },
    })
    return { ...ctx.user, phone: doctorDetails?.phone }
  } else if (ctx.user.role === 'patient') {
    const patientDetails = await db.query.patients.findFirst({
      where: (patient, { eq }) => eq(patient.userId, ctx.user?.id ?? ''),
      columns: {
        phone: true,
      },
    })
    return { ...ctx.user, phone: patientDetails?.phone }
  }

  return ctx.user
})

/**
 * Create a new appointment with comprehensive validation
 *
 * Validates:
 * - Time slot availability (no double bookings)
 * - Appointment is within doctor's operating hours
 * - No duplicate appointments for same patient/doctor/time
 */
export const createAppointment = procedure
  .input(newAppointmentSchema)
  .mutation(async ({ ctx, input }) => {
    // Validate appointment slot is available (no conflicts)
    const slotValidation = await validateAppointmentSlot(
      input.doctorId,
      input.date,
    )
    if (!slotValidation.valid) {
      throw new TRPCError({
        code: slotValidation.code === 'CONFLICT' ? 'CONFLICT' : 'BAD_REQUEST',
        message: slotValidation.error ?? 'Invalid appointment time',
      })
    }

    // Check for duplicate appointments
    const duplicateCheck = await checkDuplicateAppointment(
      ctx.user?.id ?? '',
      input.doctorId,
      input.date,
    )
    if (!duplicateCheck.valid) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: duplicateCheck.error ?? 'Duplicate appointment',
      })
    }

    // Check if patient exists, create if not
    const patient = await ctx.db.query.patients.findFirst({
      where: (patient, { eq }) => eq(patient.id, ctx.user?.id ?? ''),
    })
    if (!patient) {
      await ctx.db.insert(patients).values({
        id: ctx.user?.id ?? '',
        userId: ctx.user?.id ?? '',
        phone: input.phone,
        dob: input.dob,
        lastAppointment: input.date,
      })
    }

    // Create the appointment
    const [appointment] = await db
      .insert(appointments)
      .values({
        doctorId: input.doctorId,
        patientId: ctx.user?.id ?? '',
        appointmentDate: input.date,
        patientNotes: input.notes,
        type: input.appointmentType,
        status: AppointmentStatus.PENDING,
      })
      .returning()

    // Log the appointment creation
    await db.insert(appointmentLogs).values({
      appointmentId: appointment?.id ?? '',
      status: AppointmentStatus.PENDING,
    })

    return { success: true, appointmentId: appointment?.id }
  })

/**
 * List user's appointments with pagination
 */
export const listAppointments = procedure
  .input(appointmentListSchema)
  .query(async ({ ctx, input }) => {
    return await User.getUserAppointments(ctx.user.id ?? '', input)
  })

/**
 * Cancel an appointment
 *
 * @input appointmentId - The appointment to cancel
 * @input reason - Optional reason for cancellation (for audit trail)
 */
export const cancelAppointment = procedure
  .input(
    z.object({
      appointmentId: z.string(),
      reason: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return User.cancelAppointment(input.appointmentId, ctx.user.id ?? '')
  })

/**
 * Reschedule an appointment with validation
 *
 * Validates:
 * - New date is in the future
 * - New time slot is available
 */
export const rescheduleAppointment = procedure
  .input(
    z.object({
      appointmentId: z.string(),
      newDate: z.date(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Validate the reschedule
    const validation = await validateReschedule(
      input.appointmentId,
      input.newDate,
      ctx.user.id ?? '',
    )

    if (!validation.valid) {
      throw new TRPCError({
        code: validation.code === 'CONFLICT' ? 'CONFLICT' : 'BAD_REQUEST',
        message: validation.error ?? 'Cannot reschedule to this time',
      })
    }

    return User.rescheduleAppointment(
      input.appointmentId,
      ctx.user.id ?? '',
      input.newDate,
    )
  })
