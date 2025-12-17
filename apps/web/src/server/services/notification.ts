/**
 * Notification Service
 *
 * Handles in-app notifications and email notifications for various events:
 * - Appointment confirmations
 * - Appointment reminders
 * - Appointment cancellations
 * - System announcements
 *
 * @module NotificationService
 */

import { env } from '@web/env'
import { and, desc, eq, sql } from 'drizzle-orm'
import { Resend } from 'resend'
import { db } from '../db'
import { appointments, notifications, users } from '../db/schema'

const resend = new Resend(env.RESEND_API_KEY)

// Notification types for type safety
export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_reminder'
  | 'appointment_rescheduled'
  | 'system_announcement'

interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, unknown>
  sendEmail?: boolean
}

interface NotificationFilters {
  userId: string
  isRead?: boolean
  limit?: number
  offset?: number
}

/**
 * NotificationService handles all notification-related operations
 */
export class NotificationService {
  /**
   * Creates an in-app notification for a user
   */
  static async createNotification({
    userId,
    type,
    title,
    message,
    metadata,
    sendEmail = false,
  }: CreateNotificationInput) {
    try {
      // Insert into database
      const [notification] = await db
        .insert(notifications)
        .values({
          userId,
          type,
          title,
          message,
          metadata: metadata ? JSON.stringify(metadata) : null,
          isRead: false,
        })
        .returning()

      // Optionally send email
      if (sendEmail) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        })

        if (user?.email) {
          await this.sendEmailNotification(user.email, title, message)
        }
      }

      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  /**
   * Sends an email notification
   */
  private static async sendEmailNotification(
    email: string,
    subject: string,
    message: string,
  ) {
    try {
      await resend.emails.send({
        from: 'Ask Remo Health <notifications@askremohealth.com>',
        to: email,
        subject: `${subject} - Ask Remo Health`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .container { padding: 20px; }
                .header { background: #0070f3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${subject}</h1>
                </div>
                <div class="content">
                  <p>${message}</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Ask Remo Health. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    } catch (error) {
      console.error('Error sending email notification:', error)
      // Don't throw - email failure shouldn't break the main flow
    }
  }

  /**
   * Get notifications for a user with pagination
   */
  static async getNotifications({
    userId,
    isRead,
    limit = 20,
    offset = 0,
  }: NotificationFilters) {
    try {
      const conditions = [eq(notifications.userId, userId)]

      if (isRead !== undefined) {
        conditions.push(eq(notifications.isRead, isRead))
      }

      const results = await db.query.notifications.findMany({
        where: and(...conditions),
        orderBy: desc(notifications.createdAt),
        limit,
        offset,
      })

      return results
    } catch (error) {
      console.error('Error getting notifications:', error)
      throw error
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string) {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
          ),
        )

      return result[0]?.count ?? 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId),
          ),
        )

      return { success: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
          ),
        )

      return { success: true }
    } catch (error) {
      console.error('Error marking all as read:', error)
      throw error
    }
  }

  // =========================================================================
  // APPOINTMENT NOTIFICATION HELPERS
  // =========================================================================

  /**
   * Sends notification when an appointment is confirmed
   */
  static async notifyAppointmentConfirmed(appointmentId: string) {
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      with: {
        patient: {
          with: { user: true },
        },
        doctor: {
          with: { user: true },
        },
      },
    })

    if (!appointment) return

    const doctorName = appointment.doctor?.user
      ? `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
      : 'your doctor'

    const patientName = appointment.patient?.user
      ? `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
      : 'Patient'

    const appointmentDate = new Date(
      appointment.appointmentDate,
    ).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Notify patient
    if (appointment.patient?.userId) {
      await this.createNotification({
        userId: appointment.patient.userId,
        type: 'appointment_confirmed',
        title: 'Appointment Confirmed',
        message: `Your appointment with ${doctorName} on ${appointmentDate} has been confirmed.`,
        metadata: { appointmentId },
        sendEmail: true,
      })
    }

    // Notify doctor
    if (appointment.doctor?.userId) {
      await this.createNotification({
        userId: appointment.doctor.userId,
        type: 'appointment_confirmed',
        title: 'New Appointment',
        message: `${patientName} has booked an appointment with you on ${appointmentDate}.`,
        metadata: { appointmentId },
        sendEmail: true,
      })
    }
  }

  /**
   * Sends notification when an appointment is cancelled
   */
  static async notifyAppointmentCancelled(
    appointmentId: string,
    cancelledBy: 'patient' | 'doctor',
  ) {
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      with: {
        patient: {
          with: { user: true },
        },
        doctor: {
          with: { user: true },
        },
      },
    })

    if (!appointment) return

    const doctorName = appointment.doctor?.user
      ? `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
      : 'your doctor'

    const appointmentDate = new Date(
      appointment.appointmentDate,
    ).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })

    // Notify the other party
    if (cancelledBy === 'patient' && appointment.doctor?.userId) {
      await this.createNotification({
        userId: appointment.doctor.userId,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `A patient has cancelled their appointment on ${appointmentDate}.`,
        metadata: { appointmentId },
        sendEmail: true,
      })
    } else if (cancelledBy === 'doctor' && appointment.patient?.userId) {
      await this.createNotification({
        userId: appointment.patient.userId,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Your appointment with ${doctorName} on ${appointmentDate} has been cancelled. Please reschedule at your convenience.`,
        metadata: { appointmentId },
        sendEmail: true,
      })
    }
  }

  /**
   * Sends reminder notification for upcoming appointment
   * Should be called by a cron job
   */
  static async sendAppointmentReminder(
    appointmentId: string,
    hoursBeforeAppointment = 24,
  ) {
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      with: {
        patient: {
          with: { user: true },
        },
        doctor: {
          with: { user: true },
        },
      },
    })

    if (!appointment) return

    const doctorName = appointment.doctor?.user
      ? `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
      : 'your doctor'

    const appointmentDate = new Date(
      appointment.appointmentDate,
    ).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Remind patient
    if (appointment.patient?.userId) {
      await this.createNotification({
        userId: appointment.patient.userId,
        type: 'appointment_reminder',
        title: 'Upcoming Appointment Reminder',
        message: `Reminder: You have an appointment with ${doctorName} on ${appointmentDate}. Please ensure you're prepared.`,
        metadata: { appointmentId, hoursBeforeAppointment },
        sendEmail: true,
      })
    }
  }
}
