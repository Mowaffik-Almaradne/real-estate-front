export const CHAT_EVENTS = {
  MESSAGE_SENT: "MessageSent",
  MESSAGE_DELETED: "MessageDeleted",
  USER_TYPING: "UserTyping",
} as const

export const USER_EVENTS = {
  NEW_NOTIFICATION: "NewNotification",
  UNREAD_COUNT_UPDATED: "UnreadCountUpdated",
} as const