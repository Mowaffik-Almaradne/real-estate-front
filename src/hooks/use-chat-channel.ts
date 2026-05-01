import { useEffect, useCallback, useRef } from "react"
import { getEcho } from "@/lib/echo"
import type { MessageDto, ParticipantDto } from "@/types/chat"
import { CHAT_EVENTS } from "@/types/websocket-events"
import type { Echo } from "laravel-echo"

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
  const echoRef = useRef<Echo | null>(null)
  const roomIdRef = useRef<number | null>(null)

  const handleMessageReceived = useCallback(
    (payload: { message: MessageDto }) => {
      onMessageReceived(payload.message)
    },
    [onMessageReceived]
  )

  const handleMessageDeleted = useCallback(
    (payload: { message_id: number; room_id: number }) => {
      onMessageDeleted(payload.message_id)
    },
    [onMessageDeleted]
  )

  const handleUserTyping = useCallback(
    (payload: { user: ParticipantDto; room_id: number }) => {
      onUserTyping(payload.user)
    },
    [onUserTyping]
  )

  useEffect(() => {
    const echo = getEcho()
    if (!echo) {
      return
    }

    if (roomIdRef.current !== null && roomIdRef.current !== roomId) {
      echo.leave(`chat.${roomIdRef.current}`)
    }

    if (roomId === null) {
      roomIdRef.current = null
      echoRef.current = null
      return
    }

    const privateChannel = echo.private(`chat.${roomId}`)

    privateChannel
      .listen(CHAT_EVENTS.MESSAGE_SENT, handleMessageReceived)
      .listen(CHAT_EVENTS.MESSAGE_DELETED, handleMessageDeleted)
      .listen(CHAT_EVENTS.USER_TYPING, handleUserTyping)

    echoRef.current = echo
    roomIdRef.current = roomId

    return () => {
      echo.leave(`chat.${roomId}`)
      roomIdRef.current = null
      echoRef.current = null
    }
  }, [roomId, handleMessageReceived, handleMessageDeleted, handleUserTyping])
}