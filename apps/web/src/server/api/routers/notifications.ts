/**
 * Notifications Router
 *
 * Handles notification CRUD operations and real-time updates
 *
 * Endpoints:
 * - list: Get paginated notifications for current user
 * - unreadCount: Get count of unread notifications
 * - markAsRead: Mark a single notification as read
 * - markAllAsRead: Mark all notifications as read
 */

import { NotificationService } from '@web/server/services/notification'
import { z } from 'zod'
import { createTRPCRouter, procedure } from '../trpc'

export const notificationsRouter = createTRPCRouter({
  /**
   * List notifications for current user with pagination
   */
  list: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const notifications = await NotificationService.getNotifications({
        userId: ctx.user.id,
        isRead: input.unreadOnly ? false : undefined,
        limit: input.limit,
        offset: input.offset,
      })

      return notifications.map((notification) => ({
        ...notification,
        // Parse metadata if exists
        metadata: notification.metadata
          ? JSON.parse(notification.metadata)
          : null,
      }))
    }),

  /**
   * Get unread notification count for badge display
   */
  unreadCount: procedure.query(async ({ ctx }) => {
    return NotificationService.getUnreadCount(ctx.user.id)
  }),

  /**
   * Mark a specific notification as read
   */
  markAsRead: procedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return NotificationService.markAsRead(input.notificationId, ctx.user.id)
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: procedure.mutation(async ({ ctx }) => {
    return NotificationService.markAllAsRead(ctx.user.id)
  }),
})
