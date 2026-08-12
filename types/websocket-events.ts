export const CHAT_EVENTS = {
  MESSAGE_SENT: "MessageSent",
  MESSAGE_DELETED: "MessageDeleted",
  USER_TYPING: "UserTyping",
} as const

export const USER_EVENTS = {
  NEW_NOTIFICATION: "NewNotification",
  UNREAD_COUNT_UPDATED: "UnreadCountUpdated",
  VIEWING_UPDATED: "ViewingUpdated",
} as const

export const VIEWING_EVENTS = {
  VIEWING_UPDATED: "viewing-updated",
} as const