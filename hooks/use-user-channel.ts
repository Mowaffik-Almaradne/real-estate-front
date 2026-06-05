"use client"

import { useEffect, useCallback, useRef } from "react"
import { getEcho } from "@/lib/echo"
import type { MessageDto } from "@/types/chat"
import type { NotificationDto } from "@/types/notification"
import { USER_EVENTS, CHAT_EVENTS } from "@/types/websocket-events"

interface UseUserChannelProps {
  userId: number | null
  onNewNotification: (notification: NotificationDto) => void
  onUnreadCountUpdated: (count: number) => void
  onNewChatMessage?: (roomId: number, message: MessageDto) => void
}

export function useUserChannel({
  userId,
  onNewNotification,
  onUnreadCountUpdated,
  onNewChatMessage,
}: UseUserChannelProps): void {
  const echoRef = useRef<any>(null)
  const userIdRef = useRef<number | null>(null)

  const handleNewNotification = useCallback(
    (payload: { notification: NotificationDto }) => {
      onNewNotification(payload.notification)
    },
    [onNewNotification]
  )

  const handleUnreadCountUpdated = useCallback(
    (payload: { count: number }) => {
      onUnreadCountUpdated(payload.count)
    },
    [onUnreadCountUpdated]
  )

  const handleChatMessageSent = useCallback(
    (payload: { message: MessageDto; room_id?: number }) => {
      if (onNewChatMessage && payload.room_id) {
        onNewChatMessage(payload.room_id, payload.message)
      }
    },
    [onNewChatMessage]
  )

  useEffect(() => {
    const echo = getEcho()
    if (!echo || userId === null) {
      return
    }

    if (userIdRef.current !== null && userIdRef.current !== userId) {
      echo.leave(`user.${userIdRef.current}`)
    }

    const privateChannel = echo.private(`user.${userId}`)

    privateChannel
      .listen(USER_EVENTS.NEW_NOTIFICATION, handleNewNotification)
      .listen(USER_EVENTS.UNREAD_COUNT_UPDATED, handleUnreadCountUpdated)

    if (onNewChatMessage) {
      privateChannel.listen(CHAT_EVENTS.MESSAGE_SENT, handleChatMessageSent)
    }

    echoRef.current = echo
    userIdRef.current = userId

    return () => {
      echo.leave(`user.${userId}`)
      userIdRef.current = null
      echoRef.current = null
    }
  }, [
    userId,
    handleNewNotification,
    handleUnreadCountUpdated,
    handleChatMessageSent,
    onNewChatMessage,
  ])
}