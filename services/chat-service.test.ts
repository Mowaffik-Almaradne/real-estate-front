import { describe, it, expect, vi, beforeEach } from "vitest"
import { chatService } from "@/services/chat-service"
import type { ChatRoomDto, MessageDto } from "@/types/chat"

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  getApiPagination: (response: { data: unknown }) => {
    const payload = response.data as { pagination?: { current_page: number; total: number; per_page: number } }
    return payload?.pagination
  },
  ApiClientError: class extends Error {},
}))

function makeRoom(overrides: Partial<ChatRoomDto> = {}): ChatRoomDto {
  return {
    id: 1,
    type: "private",
    name: null,
    participants: [],
    unread_count: 0,
    created_at: "2026-08-01 10:00:00",
    updated_at: "2026-08-01 10:00:00",
    ...overrides,
  }
}

function makeMessage(overrides: Partial<MessageDto> = {}): MessageDto {
  return {
    id: 1,
    room_id: 10,
    body: "hello",
    type: "text",
    sender: { id: 2, name: "Jane" },
    created_at: "2026-08-01 10:00:00",
    ...overrides,
  }
}

describe("chatService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getRooms", () => {
    it("GETs /chat/rooms and unwraps the data array", async () => {
      const rooms = [makeRoom(), makeRoom({ id: 2 })]
      mockGet.mockResolvedValueOnce({ data: { data: rooms } })
      const result = await chatService.getRooms()
      expect(mockGet).toHaveBeenCalledWith("/chat/rooms")
      expect(result).toEqual(rooms)
    })
  })

  describe("createRoom", () => {
    it("POSTs the create request to /chat/rooms", async () => {
      const room = makeRoom()
      mockPost.mockResolvedValueOnce({ data: { data: room } })
      const result = await chatService.createRoom({ type: "group", property_id: 7 })
      expect(mockPost).toHaveBeenCalledWith(
        "/chat/rooms",
        { type: "group", property_id: 7 }
      )
      expect(result).toEqual(room)
    })
  })

  describe("getMessages", () => {
    it("GETs the room messages with default page and per_page=20", async () => {
      const messages = [makeMessage()]
      mockGet.mockResolvedValueOnce({
        data: {
          data: messages,
          pagination: { current_page: 1, total: 1, per_page: 20 },
        },
      })
      const result = await chatService.getMessages(10)
      expect(mockGet).toHaveBeenCalledWith("/chat/rooms/10/messages", {
        params: { page: 1, per_page: 20 },
      })
      expect(result.data).toEqual(messages)
      expect(result.meta).toEqual({ current_page: 1, total: 1, per_page: 20 })
    })

    it("passes custom page and perPage to the query", async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data: [],
          pagination: { current_page: 3, total: 100, per_page: 50 },
        },
      })
      const result = await chatService.getMessages(10, 3, 50)
      expect(mockGet).toHaveBeenCalledWith("/chat/rooms/10/messages", {
        params: { page: 3, per_page: 50 },
      })
      expect(result.meta).toEqual({ current_page: 3, total: 100, per_page: 50 })
    })

    it("falls back to the requested page and perPage when pagination is missing", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      const result = await chatService.getMessages(10, 2, 15)
      expect(result.meta).toEqual({ current_page: 2, total: 0, per_page: 15 })
    })
  })

  describe("sendMessage", () => {
    it("POSTs the message payload to the room messages endpoint", async () => {
      const sent = makeMessage({ id: 99, body: "hi" })
      mockPost.mockResolvedValueOnce({ data: { data: sent } })
      const result = await chatService.sendMessage(10, { body: "hi", type: "text" })
      expect(mockPost).toHaveBeenCalledWith(
        "/chat/rooms/10/messages",
        { body: "hi", type: "text" }
      )
      expect(result).toEqual(sent)
    })
  })

  describe("sendTyping", () => {
    it("POSTs to the room typing endpoint with no body", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: null } })
      await chatService.sendTyping(10)
      expect(mockPost).toHaveBeenCalledWith("/chat/rooms/10/typing")
    })
  })

  describe("deleteMessage", () => {
    it("DELETEs the message by id", async () => {
      mockDelete.mockResolvedValueOnce({ data: { data: null } })
      await chatService.deleteMessage(10, 42)
      expect(mockDelete).toHaveBeenCalledWith("/chat/rooms/10/messages/42")
    })
  })
})
