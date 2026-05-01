import type { LucideIcon } from "lucide-react"

export type NotificationCategory = "message" | "property" | "system"

export function getNotificationCategory(type: string): NotificationCategory {
  if (type.startsWith("chat_") || type === "new_message") {
    return "message"
  }
  if (
    type.startsWith("property_") ||
    type === "new_property" ||
    type === "property_approved" ||
    type === "property_rejected"
  ) {
    return "property"
  }
  return "system"
}

export interface NotificationDto {
  readonly id: string
  readonly type: string
  readonly title: string
  readonly message: string
  readonly data: Record<string, unknown> | null
  readonly read_at: string | null
  readonly created_at: string
}

export interface NotificationMeta {
  readonly current_page: number
  readonly total: number
  readonly per_page?: number
}

export interface NotificationsResponse {
  readonly data: readonly NotificationDto[]
  readonly meta: NotificationMeta
}

export interface UnreadCountResponse {
  readonly unread_count: number
}

export type NotificationDisplay = {
  readonly icon: LucideIcon
  readonly title: string
  readonly description: string
  readonly href: string
}