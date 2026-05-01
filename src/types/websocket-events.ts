import type { MessageDto, ParticipantDto } from "./chat"
import type { NotificationDto } from "./notification"

export interface MessageSentPayload {
  readonly message: MessageDto
}

export interface MessageDeletedPayload {
  readonly message_id: number
  readonly room_id: number
}

export interface UserTypingPayload {
  readonly user: ParticipantDto
  readonly room_id: number
}

export interface NewNotificationPayload {
  readonly notification: NotificationDto
}

export interface UnreadCountUpdatedPayload {
  readonly count: number
}

export interface PropertyUpdatedPayload {
  readonly property_id: number
  readonly changes: Record<string, unknown>
}

export type ChannelEvent<T> = {
  readonly event: string
  readonly payload: T
}

export const CHAT_EVENTS = {
  MESSAGE_SENT: "MessageSent",
  MESSAGE_DELETED: "MessageDeleted",
  USER_TYPING: "UserTyping",
} as const

export const USER_EVENTS = {
  NEW_NOTIFICATION: "NewNotification",
  UNREAD_COUNT_UPDATED: "UnreadCountUpdated",
} as const

export const PROPERTY_EVENTS = {
  PROPERTY_UPDATED: "PropertyUpdated",
} as const