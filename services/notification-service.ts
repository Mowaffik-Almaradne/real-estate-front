import { apiClient, getApiData, getApiPagination, ApiClientError, type ApiResponse } from "@/lib/apiClient"
import type { NotificationDto, NotificationsResponse } from "@/types/notification"

export { ApiClientError as NotificationServiceError }

export const notificationService = {
  async getNotifications(
    page: number = 1,
    perPage: number = 20
  ): Promise<NotificationsResponse> {
    const response = await apiClient.get<ApiResponse<NotificationDto[]>>("/notifications", {
      params: { page, per_page: perPage },
    })
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      meta: {
        current_page: pagination?.current_page ?? page,
        total: pagination?.total ?? 0,
        per_page: pagination?.per_page ?? perPage,
      },
    }
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ unread_count: number }>>(
      "/notifications/unread-count"
    )
    return getApiData(response).unread_count
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch("/notifications/read-all")
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`)
  },
}
