"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationService } from "@/services/notification-service"
import type { NotificationDto } from "@/types/notification"

const NOTIFICATIONS_PER_PAGE = 20

interface NotificationState {
  notifications: NotificationDto[]
  unreadCount: number
  isLoading: boolean
  hasMore: boolean
  error: string | null
}

export function useNotificationsReact() {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    hasMore: false,
    error: null,
  })

  const [currentPage, setCurrentPage] = useState(1)

  const fetchNotifications = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const result = await notificationService.getNotifications(1, NOTIFICATIONS_PER_PAGE)
      setState((prev) => ({
        ...prev,
        notifications: result.data,
        isLoading: false,
        hasMore: result.data.length < result.meta.total,
      }))
      setCurrentPage(1)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch notifications"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const fetchUnreadCount = useCallback(async (): Promise<void> => {
    try {
      const count = await notificationService.getUnreadCount()
      setState((prev) => ({ ...prev, unreadCount: count }))
    } catch {
      // Silently fail
    }
  }, [])

  const loadMore = useCallback(async (): Promise<void> => {
    if (state.isLoading || !state.hasMore) return

    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const nextPage = currentPage + 1
      const result = await notificationService.getNotifications(nextPage, NOTIFICATIONS_PER_PAGE)
      setState((prev) => ({
        ...prev,
        notifications: [...prev.notifications, ...result.data],
        isLoading: false,
        hasMore: prev.notifications.length < result.meta.total,
      }))
      setCurrentPage(nextPage)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load more"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [currentPage, state.isLoading, state.hasMore])

  const markAsRead = useCallback((id: string): void => {
    setState((prev) => {
      const index = prev.notifications.findIndex((n) => n.id === id)
      if (index === -1 || prev.notifications[index].read_at) {
        return prev
      }

      const updated = [...prev.notifications]
      updated[index] = { ...updated[index], read_at: new Date().toISOString() }

      return {
        ...prev,
        notifications: updated,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }
    })

    notificationService.markAsRead(id).catch(() => {
      setState((prev) => {
        const index = prev.notifications.findIndex((n) => n.id === id)
        if (index === -1) return prev

        const updated = [...prev.notifications]
        updated[index] = { ...updated[index], read_at: null }

        return {
          ...prev,
          notifications: updated,
          unreadCount: prev.unreadCount + 1,
        }
      })
    })
  }, [])

  const markAllAsRead = useCallback((): void => {
    const now = new Date().toISOString()
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.read_at ? n : { ...n, read_at: now }
      ),
      unreadCount: 0,
    }))

    notificationService.markAllAsRead().catch(() => {
      fetchNotifications()
      fetchUnreadCount()
    })
  }, [fetchNotifications, fetchUnreadCount])

  const deleteNotification = useCallback((id: string): void => {
    setState((prev) => {
      const index = prev.notifications.findIndex((n) => n.id === id)
      if (index === -1) return prev

      const wasUnread = !prev.notifications[index].read_at
      const updated = prev.notifications.filter((n) => n.id !== id)

      return {
        ...prev,
        notifications: updated,
        unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
      }
    })

    notificationService.deleteNotification(id).catch(() => {
      fetchNotifications()
    })
  }, [fetchNotifications])

  const appendNotification = useCallback((notification: NotificationDto): void => {
    setState((prev) => {
      const exists = prev.notifications.some((n) => n.id === notification.id)
      if (exists) return prev

      return {
        ...prev,
        notifications: [notification, ...prev.notifications],
        unreadCount: notification.read_at
          ? prev.unreadCount
          : prev.unreadCount + 1,
      }
    })
  }, [])

  const updateCount = useCallback((count: number): void => {
    setState((prev) => ({ ...prev, unreadCount: count }))
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void Promise.all([fetchNotifications(), fetchUnreadCount()])
    }, 0)
    return () => window.clearTimeout(handle)
  }, [fetchNotifications, fetchUnreadCount])

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    error: state.error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    appendNotification,
    updateCount,
  }
}
