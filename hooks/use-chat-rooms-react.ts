"use client"

import { useState, useEffect, useCallback } from "react"
import type { ChatRoomDto, LastMessageDto, SendMessageRequest } from "@/types/chat"
import { chatService, ChatServiceError } from "@/services/chat-service"

export function useChatRoomsReact() {
  const [rooms, setRooms] = useState<ChatRoomDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await chatService.getRooms()
      setRooms(data)
    } catch (e) {
      if (e instanceof ChatServiceError) {
        setError(e.message)
      } else {
        setError("Failed to fetch chat rooms")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const addMessage = useCallback(
    async (
      roomId: number,
      message: SendMessageRequest
    ): Promise<ChatRoomDto | null> => {
      try {
        const sentMessage = await chatService.sendMessage(roomId, message)

        setRooms((prev) => {
          const roomIndex = prev.findIndex((r) => r.id === roomId)
          if (roomIndex === -1) return prev

          const updatedRoom = { ...prev[roomIndex] }
          updatedRoom.last_message = {
            body: sentMessage.body,
            type: sentMessage.type,
            sender_id: sentMessage.sender.id,
            created_at: sentMessage.created_at,
          }
          updatedRoom.unread_count += 1

          const newRooms = [...prev]
          newRooms.splice(roomIndex, 1)
          newRooms.unshift(updatedRoom)
          return newRooms
        })

        return sentMessage
      } catch (e) {
        if (e instanceof ChatServiceError) {
          setError(e.message)
        } else {
          setError("Failed to send message")
        }
        return null
      }
    },
    []
  )

  const updateUnreadCount = useCallback((roomId: number, count: number): void => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, unread_count: count } : r))
    )
  }, [])

  const markRoomAsRead = useCallback((roomId: number): void => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, unread_count: 0 } : r))
    )
  }, [])

  const moveRoomToTop = useCallback(
    (roomId: number, lastMessage: LastMessageDto): void => {
      setRooms((prev) => {
        const roomIndex = prev.findIndex((r) => r.id === roomId)
        if (roomIndex === -1) return prev

        const newRooms = [...prev]
        const [room] = newRooms.splice(roomIndex, 1)
        newRooms.unshift({ ...room, last_message: lastMessage })
        return newRooms
      })
    },
    []
  )

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return {
    rooms,
    loading,
    error,
    addMessage,
    updateUnreadCount,
    markRoomAsRead,
    moveRoomToTop,
    fetchRooms,
  }
}