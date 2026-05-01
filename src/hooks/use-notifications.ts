import { ref, onMounted, onUnmounted } from "vue"
import { notificationService, NotificationServiceError } from "@/services/notification-service"
import { NotificationDto } from "@/types/notification"

export function useNotifications() {
  const notifications = ref<NotificationDto[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const hasMore = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const perPage = ref(20)
  let pollingInterval: ReturnType<typeof setInterval> | null = null

  const fetchNotifications = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const result = await notificationService.getNotifications(1, perPage.value)
      notifications.value = result.data
      currentPage.value = 1
      hasMore.value = result.data.length < result.meta.total
    } catch (e) {
      if (e instanceof NotificationServiceError) {
        error.value = e.message
      } else {
        error.value = "Failed to fetch notifications"
      }
    } finally {
      isLoading.value = false
    }
  }

  const fetchUnreadCount = async (): Promise<void> => {
    try {
      unreadCount.value = await notificationService.getUnreadCount()
    } catch {
      // Silently fail for unread count
    }
  }

  const loadMore = async (): Promise<void> => {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    error.value = null
    try {
      const nextPage = currentPage.value + 1
      const result = await notificationService.getNotifications(nextPage, perPage.value)
      notifications.value = [...notifications.value, ...result.data]
      currentPage.value = nextPage
      hasMore.value = notifications.value.length < result.meta.total
    } catch (e) {
      if (e instanceof NotificationServiceError) {
        error.value = e.message
      } else {
        error.value = "Failed to load more notifications"
      }
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = (id: string): void => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1 && !notifications.value[index].read_at) {
      notifications.value[index] = {
        ...notifications.value[index],
        read_at: new Date().toISOString(),
      }
      unreadCount.value = Math.max(0, unreadCount.value - 1)

      notificationService.markAsRead(id).catch(() => {
        notifications.value[index] = {
          ...notifications.value[index],
          read_at: null,
        }
        unreadCount.value += 1
      })
    }
  }

  const markAllAsRead = (): void => {
    const now = new Date().toISOString()
    notifications.value = notifications.value.map((n) => ({
      ...n,
      read_at: n.read_at || now,
    }))
    const prevUnread = unreadCount.value
    unreadCount.value = 0

    notificationService.markAllAsRead().catch(() => {
      notifications.value = notifications.value.map((n, i) => ({
        ...n,
        read_at: i < prevUnread ? null : n.read_at,
      }))
      unreadCount.value = prevUnread
    })
  }

  const deleteNotification = (id: string): void => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      const wasUnread = !notifications.value[index].read_at
      const removed = notifications.value.splice(index, 1)[0]

      if (wasUnread) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      notificationService.deleteNotification(id).catch(() => {
        notifications.value.splice(index, 0, removed)
        if (wasUnread) {
          unreadCount.value += 1
        }
      })
    }
  }

  const appendNotification = (n: NotificationDto): void => {
    const exists = notifications.value.some((existing) => existing.id === n.id)
    if (!exists) {
      notifications.value.unshift(n)
      if (!n.read_at) {
        unreadCount.value += 1
      }
    }
  }

  const refreshUnreadCount = async (): Promise<void> => {
    await fetchUnreadCount()
  }

  const startPolling = (): void => {
    if (!pollingInterval) {
      pollingInterval = setInterval(fetchUnreadCount, 30000)
    }
  }

  const stopPolling = (): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  onMounted(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()])
    startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    appendNotification,
    refreshUnreadCount,
  }
}