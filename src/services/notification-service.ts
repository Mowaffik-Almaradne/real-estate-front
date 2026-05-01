import { getAuthToken } from "@/lib/auth"
import {
  NotificationDto,
  NotificationsResponse,
  UnreadCountResponse,
} from "@/types/notification"

export class NotificationServiceError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "NotificationServiceError"
    this.status = status
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1"

function getHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const message = errorData?.message || `HTTP error ${response.status}`
    throw new NotificationServiceError(response.status, message)
  }
  const json = await response.json()
  return json.data as T
}

export const notificationService = {
  async getNotifications(
    page: number = 1,
    perPage: number = 20
  ): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    })
    const response = await fetch(
      `${API_BASE_URL}/notifications?${params}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    )
    return handleResponse<NotificationsResponse>(response)
  },

  async getUnreadCount(): Promise<number> {
    const response = await fetch(
      `${API_BASE_URL}/notifications/unread-count`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    )
    const result = await handleResponse<UnreadCountResponse>(response)
    return result.unread_count
  },

  async markAsRead(id: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${id}/read`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    )
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData?.message || `HTTP error ${response.status}`
      throw new NotificationServiceError(response.status, message)
    }
  },

  async markAllAsRead(): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/notifications/read-all`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    )
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData?.message || `HTTP error ${response.status}`
      throw new NotificationServiceError(response.status, message)
    }
  },

  async deleteNotification(id: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    )
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData?.message || `HTTP error ${response.status}`
      throw new NotificationServiceError(response.status, message)
    }
  },
}