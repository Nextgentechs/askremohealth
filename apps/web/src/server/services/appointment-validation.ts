/**
 * Appointment Validation Service
 *
 * Provides comprehensive validation for appointment booking to ensure:
 * - No double bookings
 * - Appointments are within doctor's operating hours
 * - Dates are valid and in the future
 * - Proper time slot management
 *
 * @module server/services/appointment-validation
 */

import { db } from '@web/server/db'
import { appointments, operatingHours } from '@web/server/db/schema'
import { and, eq, gte, lte, ne, or } from 'drizzle-orm'

/**
 * Result of appointment validation
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  code?:
    | 'CONFLICT'
    | 'OUTSIDE_HOURS'
    | 'PAST_DATE'
    | 'DOCTOR_UNAVAILABLE'
    | 'INVALID_DURATION'
}

/**
 * Check if an appointment time slot is available for a doctor
 *
 * @param doctorId - The doctor's ID
 * @param appointmentDate - The proposed appointment date/time
 * @param durationMinutes - The appointment duration in minutes (default: 30)
 * @param excludeAppointmentId - Optional appointment ID to exclude (for rescheduling)
 * @returns Validation result indicating if the slot is available
 */
export async function validateAppointmentSlot(
  doctorId: string,
  appointmentDate: Date,
  durationMinutes = 30,
  excludeAppointmentId?: string,
): Promise<ValidationResult> {
  // 1. Check if the date is in the future
  if (appointmentDate <= new Date()) {
    return {
      valid: false,
      error: 'Appointment date must be in the future',
      code: 'PAST_DATE',
    }
  }

  // 2. Calculate appointment end time
  const appointmentEndTime = new Date(
    appointmentDate.getTime() + durationMinutes * 60 * 1000,
  )

  // 3. Check for overlapping appointments
  const conflictingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.doctorId, doctorId),
      // Exclude cancelled and completed appointments from conflict check
      or(
        eq(appointments.status, 'scheduled'),
        eq(appointments.status, 'pending'),
        eq(appointments.status, 'rescheduled'),
      ),
      // Check for time overlap
      // An overlap occurs if:
      // - New start time is before existing end time AND
      // - New end time is after existing start time
      gte(
        appointments.appointmentDate,
        new Date(appointmentDate.getTime() - durationMinutes * 60 * 1000),
      ),
      lte(appointments.appointmentDate, appointmentEndTime),
      // Exclude the current appointment if rescheduling
      excludeAppointmentId
        ? ne(appointments.id, excludeAppointmentId)
        : undefined,
    ),
  })

  if (conflictingAppointments.length > 0) {
    return {
      valid: false,
      error:
        'This time slot is already booked. Please select a different time.',
      code: 'CONFLICT',
    }
  }

  // 4. Check if appointment is within doctor's operating hours
  const doctorHours = await db.query.operatingHours.findFirst({
    where: eq(operatingHours.doctorId, doctorId),
  })

  if (doctorHours?.schedule && Array.isArray(doctorHours.schedule)) {
    const dayName = appointmentDate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()
    const daySchedule = doctorHours.schedule.find(
      (s) => s.day.toLowerCase() === dayName,
    )

    if (!daySchedule?.isOpen) {
      return {
        valid: false,
        error: `Doctor is not available on ${dayName}s`,
        code: 'DOCTOR_UNAVAILABLE',
      }
    }

    // Parse operating hours
    if (daySchedule.opening && daySchedule.closing) {
      const appointmentHour = appointmentDate.getHours()
      const appointmentMinute = appointmentDate.getMinutes()
      const appointmentTimeInMinutes = appointmentHour * 60 + appointmentMinute

      const [openHour, openMinute] = daySchedule.opening.split(':').map(Number)
      const [closeHour, closeMinute] = daySchedule.closing
        .split(':')
        .map(Number)

      const openTimeInMinutes = (openHour ?? 0) * 60 + (openMinute ?? 0)
      const closeTimeInMinutes = (closeHour ?? 0) * 60 + (closeMinute ?? 0)

      // Check if appointment time is within operating hours
      if (
        appointmentTimeInMinutes < openTimeInMinutes ||
        appointmentTimeInMinutes + durationMinutes > closeTimeInMinutes
      ) {
        return {
          valid: false,
          error: `Appointment must be between ${daySchedule.opening} and ${daySchedule.closing}`,
          code: 'OUTSIDE_HOURS',
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Check if a patient already has an appointment with the same doctor
 * at the same time (prevents duplicate bookings)
 *
 * @param patientId - The patient's ID
 * @param doctorId - The doctor's ID
 * @param appointmentDate - The proposed appointment date/time
 * @returns Validation result
 */
export async function checkDuplicateAppointment(
  patientId: string,
  doctorId: string,
  appointmentDate: Date,
): Promise<ValidationResult> {
  // Allow same day but different time
  const startOfDay = new Date(appointmentDate)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(appointmentDate)
  endOfDay.setHours(23, 59, 59, 999)

  const existingAppointment = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.patientId, patientId),
      eq(appointments.doctorId, doctorId),
      eq(appointments.appointmentDate, appointmentDate),
      or(
        eq(appointments.status, 'scheduled'),
        eq(appointments.status, 'pending'),
      ),
    ),
  })

  if (existingAppointment) {
    return {
      valid: false,
      error: 'You already have an appointment with this doctor at this time',
      code: 'CONFLICT',
    }
  }

  return { valid: true }
}

/**
 * Validate reschedule request
 *
 * @param appointmentId - The appointment to reschedule
 * @param newDate - The new date/time
 * @param userId - The user requesting the reschedule
 * @returns Validation result
 */
export async function validateReschedule(
  appointmentId: string,
  newDate: Date,
  _userId: string,
): Promise<ValidationResult> {
  // Check if new date is in the future
  if (newDate <= new Date()) {
    return {
      valid: false,
      error: 'Cannot reschedule to a past date',
      code: 'PAST_DATE',
    }
  }

  // Get the existing appointment
  const existingAppointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
  })

  if (!existingAppointment) {
    return {
      valid: false,
      error: 'Appointment not found',
      code: 'INVALID_DURATION',
    }
  }

  // Check if the new slot is available (excluding current appointment)
  return validateAppointmentSlot(
    existingAppointment.doctorId,
    newDate,
    30, // Default duration
    appointmentId,
  )
}
