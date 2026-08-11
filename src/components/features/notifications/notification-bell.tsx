"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Bell, Check } from "lucide-react"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { notificationService, NotificationServiceError } from "@/services/notification-service"
import type { NotificationDto } from "@/types/notification"
import { NotificationItem } from "./notification-item"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await notificationService.getNotifications(1, 5)
      setNotifications(result.data)
    } catch (e) {
      setError(e instanceof NotificationServiceError ? e.message : "Failed to fetch")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch {
      // Silently fail
    }
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    notificationService.markAsRead(id).catch(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: null } : n))
      )
      setUnreadCount((prev) => prev + 1)
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString()
    setNotifications((prev) =>
      prev.map((n) => (n.read_at ? n : { ...n, read_at: now }))
    )
    const prevCount = unreadCount
    setUnreadCount(0)

    notificationService.markAllAsRead().catch(() => {
      setNotifications((prev) =>
        prev.map((n, i) => (i < prevCount ? { ...n, read_at: null } : n))
      )
      setUnreadCount(prevCount)
    })
  }, [unreadCount])

  const deleteNotification = useCallback((id: string) => {
    const wasUnread = notifications.find((n) => n.id === id)?.read_at === null
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    notificationService.deleteNotification(id).catch(() => {
      // Would need original notification to restore - simplified for now
    })
  }, [notifications])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void Promise.all([fetchNotifications(), fetchUnreadCount()])
    }, 0)

    const interval = setInterval(fetchUnreadCount, 30000)
    return () => {
      window.clearTimeout(handle)
      clearInterval(interval)
    }
  }, [fetchNotifications, fetchUnreadCount])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      fetchUnreadCount()
    }
  }

  const lastFive = notifications.slice(0, 5)
  const displayCount = unreadCount > 99 ? "99+" : unreadCount

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => handleOpenChange(!isOpen)}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full",
          "text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
            {displayCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-background shadow-lg">
          <div className="border-b px-4 py-3">
            <h3 className="font-semibold">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="size-9 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : lastFive.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="divide-y">
                {lastFive.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3">
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Check className="size-4" />
              Mark all as read
            </button>
            <Link
              href={`/${locale}/notifications`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}