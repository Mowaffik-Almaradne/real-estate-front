import { useState, useEffect, useCallback } from "react"
import { chatService, ChatServiceError } from "@/services/chat-service"
import type { ChatRoomDto, MessageDto, CreateChatRoomRequest } from "@/types/chat"

interface ChatRoomsState {
  rooms: ChatRoomDto[]
  isLoading: boolean
  error: string | null
}

export function useChatRoomsReact() {
  const [state, setState] = useState<ChatRoomsState>({
    rooms: [],
    isLoading: false,
    error: null,
  })

  const fetchRooms = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const rooms = await chatService.getRooms()
      setState((prev) => ({ ...prev, rooms, isLoading: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch rooms"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const createRoom = useCallback(
    async (request: CreateChatRoomRequest): Promise<ChatRoomDto | null> => {
      try {
        const room = await chatService.createRoom(request)
        setState((prev) => ({
          ...prev,
          rooms: [room, ...prev.rooms],
        }))
        return room
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create room"
        setState((prev) => ({ ...prev, error: message }))
        return null
      }
    },
    []
  )

  const moveRoomToTop = useCallback(
    (roomId: number, lastMessage: MessageDto): void => {
      setState((prev) => {
        const roomIndex = prev.rooms.findIndex((r) => r.id === roomId)
        if (roomIndex === -1) return prev

        const updatedRooms = [...prev.rooms]
        const room = { ...updatedRooms[roomIndex] }

        room.last_message = {
          id: lastMessage.id,
          body: lastMessage.body,
          type: lastMessage.type,
          sender_id: lastMessage.sender.id,
          created_at: lastMessage.created_at,
        }

        updatedRooms.splice(roomIndex, 1)
        updatedRooms.unshift(room)

        return { ...prev, rooms: updatedRooms }
      })
    },
    []
  )

  const updateRoomUnreadCount = useCallback(
    (roomId: number, count: number): void => {
      setState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((r) =>
          r.id === roomId ? { ...r, unread_count: count } : r
        ),
      }))
    },
    []
  )

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return {
    rooms: state.rooms,
    isLoading: state.isLoading,
    error: state.error,
    createRoom,
    moveRoomToTop,
    updateRoomUnreadCount,
    refreshRooms: fetchRooms,
  }
}