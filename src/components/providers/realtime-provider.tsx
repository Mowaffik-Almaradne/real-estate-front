"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react"
import { useNotificationsReact } from "@/hooks/use-notifications-react"
import { useChatRoomsReact } from "@/hooks/use-chat-rooms-react"
import { useUserChannel } from "@/hooks/use-user-channel"
import { destroyEcho } from "@/lib/echo"
import type { NotificationDto } from "@/types/notification"
import type { MessageDto } from "@/types/chat"

interface RealtimeContextValue {
  notifications: ReturnType<typeof useNotificationsReact>
  chatRooms: ReturnType<typeof useChatRoomsReact>
  currentUserId: number | null
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null)

interface RealtimeProviderProps {
  children: ReactNode
  currentUserId: number | null
}

export function RealtimeProvider({
  children,
  currentUserId,
}: RealtimeProviderProps) {
  const notifications = useNotificationsReact()
  const chatRooms = useChatRoomsReact()

  const handleNewNotification = useCallback((notification: NotificationDto): void => {
    notifications.appendNotification(notification)
  }, [notifications.appendNotification])

  const handleUnreadCountUpdated = useCallback((count: number): void => {
    notifications.updateCount(count)
  }, [notifications.updateCount])

  const handleNewChatMessage = useCallback((roomId: number, message: MessageDto): void => {
    chatRooms.moveRoomToTop(roomId, message)
  }, [chatRooms.moveRoomToTop])

  useUserChannel({
    userId: currentUserId,
    onNewNotification: handleNewNotification,
    onUnreadCountUpdated: handleUnreadCountUpdated,
    onNewChatMessage: handleNewChatMessage,
  })

  useEffect(() => {
    return () => {
      destroyEcho()
    }
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      chatRooms,
      currentUserId,
    }),
    [notifications, chatRooms, currentUserId]
  )

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error(
      "useRealtimeContext must be used within a RealtimeProvider"
    )
  }
  return context
}
