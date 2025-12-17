'use client'

import { api } from '@web/trpc/react'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'

/**
 * NotificationBell Component
 *
 * Displays a bell icon with unread count badge and a dropdown panel
 * showing recent notifications with mark as read functionality.
 */
export function NotificationBell() {
  const utils = api.useUtils()

  // Fetch unread count for badge
  const { data: unreadCount = 0 } = api.notifications.unreadCount.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  )

  // Fetch recent notifications
  const { data: notifications = [], isLoading } =
    api.notifications.list.useQuery(
      { limit: 10, offset: 0 },
      {
        refetchInterval: 30000,
      },
    )

  // Mark single notification as read
  const { mutate: markAsRead } = api.notifications.markAsRead.useMutation({
    onSuccess: () => {
      void utils.notifications.list.invalidate()
      void utils.notifications.unreadCount.invalidate()
    },
  })

  // Mark all notifications as read
  const { mutate: markAllAsRead, isPending: isMarkingAll } =
    api.notifications.markAllAsRead.useMutation({
      onSuccess: () => {
        void utils.notifications.list.invalidate()
        void utils.notifications.unreadCount.invalidate()
      },
    })

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead({ notificationId })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="mr-1 h-3 w-3" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <button
                    type="button"
                    className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${
                      !notification.isRead ? 'bg-muted/30' : ''
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification.id,
                        notification.isRead ?? false,
                      )
                    }
                  >
                    <div className="flex items-start gap-3">
                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                      <div
                        className={`flex-1 ${notification.isRead ? 'pl-5' : ''}`}
                      >
                        <p className="text-sm font-medium leading-tight">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
