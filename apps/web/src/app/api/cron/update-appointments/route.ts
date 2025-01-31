import { db } from '@web/server/db'
import { appointments, appointmentLogs } from '@web/server/db/schema'
import { AppointmentStatus } from '@web/server/api/validation'
import { and, inArray, lt } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function authenticate(req: Request) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 })
  }
}

export async function GET(req: Request) {
  try {
    await authenticate(req)

    const missedAppointments = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          lt(appointments.appointmentDate, new Date()),
          inArray(appointments.status, [
            AppointmentStatus.Scheduled,
            AppointmentStatus.Pending,
          ]),
        ),
      )

    if (missedAppointments.length > 0) {
      await db.transaction(async (tx) => {
        await Promise.all([
          tx
            .update(appointments)
            .set({ status: AppointmentStatus.Missed })
            .where(
              inArray(
                appointments.id,
                missedAppointments.map((a) => a.id),
              ),
            ),
          tx.insert(appointmentLogs).values(
            missedAppointments.map((a) => ({
              appointmentId: a.id,
              status: AppointmentStatus.Missed,
            })),
          ),
        ])
      })
    }

    return NextResponse.json({
      success: true,
      updatedCount: missedAppointments.length,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
