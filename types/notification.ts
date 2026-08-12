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
  readonly type_label?: string
  readonly title: string | null
  readonly body?: string | null
  readonly message?: string | null
  readonly data: Record<string, unknown> | null
  readonly read_at: string | null
  readonly is_read?: boolean
  readonly created_at: string
}

export interface NotificationMeta {
  current_page: number
  total: number
  per_page?: number
}

export interface NotificationsResponse {
  data: NotificationDto[]
  meta: NotificationMeta
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
