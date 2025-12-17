import { AppointmentStatus } from '@web/server/api/validators'
import { db } from '@web/server/db'
import { appointments } from '@web/server/db/schema'
import { NotificationService } from '@web/server/services/notification'
import { and, between, eq, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for processing

/**
 * Appointment Reminders Cron Job
 *
 * This endpoint should be called by a scheduler (e.g., Vercel Cron, GitHub Actions)
 * to send appointment reminders to patients.
 *
 * Schedule: Run every hour to catch appointments in the reminder windows
 *
 * Reminder windows:
 * - 24 hours before appointment
 * - 1 hour before appointment
 */

async function authenticate(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: Request) {
  try {
    // Verify cron secret
    if (!(await authenticate(req))) {
      return new Response('Unauthorized', { status: 401 })
    }

    const now = new Date()
    const results = {
      reminders24h: 0,
      reminders1h: 0,
      errors: [] as string[],
    }

    // =========================================================================
    // 24-HOUR REMINDERS
    // Find appointments between 23-25 hours from now (to handle timing variations)
    // =========================================================================
    const twentyThreeHoursFromNow = new Date(
      now.getTime() + 23 * 60 * 60 * 1000,
    )
    const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    const appointments24h = await db.query.appointments.findMany({
      where: and(
        eq(appointments.status, AppointmentStatus.Scheduled),
        between(
          appointments.appointmentDate,
          twentyThreeHoursFromNow,
          twentyFiveHoursFromNow,
        ),
        // Don't send duplicate reminders - check if reminder was already sent
        isNull(appointments.reminder24hSentAt),
      ),
      columns: {
        id: true,
        appointmentDate: true,
      },
    })

    for (const appointment of appointments24h) {
      try {
        await NotificationService.sendAppointmentReminder(appointment.id, 24)

        // Mark reminder as sent
        await db
          .update(appointments)
          .set({ reminder24hSentAt: now })
          .where(eq(appointments.id, appointment.id))

        results.reminders24h++
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(
          `24h reminder failed for ${appointment.id}: ${message}`,
        )
      }
    }

    // =========================================================================
    // 1-HOUR REMINDERS
    // Find appointments between 50-70 minutes from now
    // =========================================================================
    const fiftyMinutesFromNow = new Date(now.getTime() + 50 * 60 * 1000)
    const seventyMinutesFromNow = new Date(now.getTime() + 70 * 60 * 1000)

    const appointments1h = await db.query.appointments.findMany({
      where: and(
        eq(appointments.status, AppointmentStatus.Scheduled),
        between(
          appointments.appointmentDate,
          fiftyMinutesFromNow,
          seventyMinutesFromNow,
        ),
        // Don't send duplicate reminders
        isNull(appointments.reminder1hSentAt),
      ),
      columns: {
        id: true,
        appointmentDate: true,
      },
    })

    for (const appointment of appointments1h) {
      try {
        await NotificationService.sendAppointmentReminder(appointment.id, 1)

        // Mark reminder as sent
        await db
          .update(appointments)
          .set({ reminder1hSentAt: now })
          .where(eq(appointments.id, appointment.id))

        results.reminders1h++
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(
          `1h reminder failed for ${appointment.id}: ${message}`,
        )
      }
    }

    console.log(`[Cron] Appointment reminders sent:`, results)

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      ...results,
    })
  } catch (error) {
    console.error('[Cron] Appointment reminders failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
