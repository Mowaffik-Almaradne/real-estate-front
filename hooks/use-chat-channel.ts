"use client"

import { useEffect, useRef } from "react"
import { getEcho } from "@/lib/echo"
import type { MessageDto, ParticipantDto } from "@/types/chat"
import { CHAT_EVENTS } from "@/types/websocket-events"

interface UseChatChannelProps {
  roomId: number | null
  onMessageReceived: (msg: MessageDto) => void
  onMessageDeleted: (messageId: number) => void
  onUserTyping: (user: ParticipantDto) => void
}

export function useChatChannel({
  roomId,
  onMessageReceived,
  onMessageDeleted,
  onUserTyping,
}: UseChatChannelProps): void {
  const echoRef = useRef<any>(null)
  const roomIdRef = useRef<number | null>(null)
  const handlersRef = useRef({ onMessageReceived, onMessageDeleted, onUserTyping })

  handlersRef.current = { onMessageReceived, onMessageDeleted, onUserTyping }

  useEffect(() => {
    const echo = getEcho()
    if (!echo) {
      return
    }

    if (roomIdRef.current !== null && roomIdRef.current !== roomId) {
      echo.leave(`private-chat.${roomIdRef.current}`)
    }

    if (roomId === null) {
      roomIdRef.current = null
      echoRef.current = null
      return
    }

    const channelName = `private-chat.${roomId}`
    const privateChannel = echo.private(channelName)

    privateChannel
      .listen(CHAT_EVENTS.MESSAGE_SENT, (payload: any) => {
        handlersRef.current.onMessageReceived({
          id: payload.message_id,
          room_id: payload.room_id,
          body: payload.body,
          type: payload.type,
          attachment_url: payload.attachment_url,
          sender: payload.sender,
          created_at: payload.created_at,
        })
      })
      .listen(CHAT_EVENTS.MESSAGE_DELETED, (payload: any) => {
        handlersRef.current.onMessageDeleted(payload.message_id)
      })
      .listen(CHAT_EVENTS.USER_TYPING, (payload: any) => {
        handlersRef.current.onUserTyping({ id: payload.user_id, name: payload.user_name })
      })

    echoRef.current = echo
    roomIdRef.current = roomId

    return () => {
      echo.leave(channelName)
      roomIdRef.current = null
      echoRef.current = null
    }
  }, [roomId])
}