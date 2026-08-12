import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { MessageDto, PaginatedMessages } from "@/types/chat"
import type { UseMessagesResult } from "@/hooks/use-messages"

function renderMessagesRoom(roomId: number | null) {
  let utils: ReturnType<typeof renderHook<UseMessagesResult, { roomId: number | null }>> | undefined
  act(() => {
    utils = renderHook(({ roomId }: { roomId: number | null }) => useMessages(roomId), {
      initialProps: { roomId },
    })
  })
  if (!utils) throw new Error("hook did not render")
  return utils
}

const mockGetMessages = vi.fn()
const mockGetLatestMessages = vi.fn()
const mockSendMessage = vi.fn()
const mockChannelHandlers: {
  onMessageReceived?: (msg: MessageDto) => void
  onMessageDeleted?: (messageId: number) => void
  onUserTyping?: (user: { id: number; name: string }) => void
} = {}

const mockPusher = {
  connection: {
    state: "connected",
    bind: vi.fn(),
    unbind: vi.fn(),
  },
}

vi.mock("@/services/chat-service", () => ({
  chatService: {
    getMessages: (...args: unknown[]) => mockGetMessages(...args),
    getLatestMessages: (...args: unknown[]) => mockGetLatestMessages(...args),
    sendMessage: (...args: unknown[]) => mockSendMessage(...args),
  },
}))

vi.mock("@/hooks/use-chat-channel", () => ({
  useChatChannel: (handlers: typeof mockChannelHandlers) => {
    mockChannelHandlers.onMessageReceived = handlers.onMessageReceived
    mockChannelHandlers.onMessageDeleted = handlers.onMessageDeleted
    mockChannelHandlers.onUserTyping = handlers.onUserTyping
  },
}))

vi.mock("@/lib/echo", () => ({
  getEcho: () => ({ __echo: true }),
  getPusherConnection: () => mockPusher,
}))

import { useMessages } from "@/hooks/use-messages"

function makeMessage(overrides: Partial<MessageDto> = {}): MessageDto {
  return {
    id: 1,
    room_id: 10,
    body: "hello",
    type: "text",
    sender: { id: 2, name: "Jane" },
    created_at: "2026-05-03T10:30:00Z",
    ...overrides,
  }
}

function makePage(
  messages: MessageDto[],
  page: number,
  perPage: number,
  total: number
): PaginatedMessages & { page: number } {
  return {
    data: messages,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: Math.max(1, Math.ceil(total / perPage)),
    },
    page,
  }
}

describe("useMessages", () => {
  beforeEach(() => {
    mockGetMessages.mockReset()
    mockGetLatestMessages.mockReset()
    mockSendMessage.mockReset()
    mockPusher.connection.state = "connected"
    mockPusher.connection.bind.mockClear()
    mockPusher.connection.unbind.mockClear()
    Object.keys(mockChannelHandlers).forEach((k) =>
      delete mockChannelHandlers[k as keyof typeof mockChannelHandlers]
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("does not fetch when roomId is null", () => {
    renderMessagesRoom(null)
    expect(mockGetLatestMessages).not.toHaveBeenCalled()
  })

  it("fetches latest messages on mount", async () => {
    const page = makePage([makeMessage({ id: 1 }), makeMessage({ id: 2 })], 1, 20, 2)
    mockGetLatestMessages.mockResolvedValueOnce(page)

    const { result } = renderMessagesRoom(10)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockGetLatestMessages).toHaveBeenCalledWith(10)
    expect(result.current.messages.map((m) => m.id)).toEqual([1, 2])
    expect(result.current.hasMore).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("sets hasMore when latest page is not the first page", async () => {
    const page = makePage([makeMessage({ id: 21 })], 2, 20, 25)
    mockGetLatestMessages.mockResolvedValueOnce(page)

    const { result } = renderMessagesRoom(10)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.hasMore).toBe(true)
  })

  it("surfaces fetch errors", async () => {
    mockGetLatestMessages.mockRejectedValueOnce(new Error("boom"))

    const { result } = renderMessagesRoom(10)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe("boom")
  })

  it("resets state when switching to null roomId", async () => {
    const page = makePage([makeMessage({ id: 1 })], 1, 20, 1)
    mockGetLatestMessages.mockResolvedValueOnce(page)

    const { result, rerender } = renderMessagesRoom(10)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.messages).toHaveLength(1)

    await act(async () => {
      rerender({ roomId: null })
    })

    expect(result.current.messages).toEqual([])
    expect(result.current.hasMore).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("refetches when roomId changes", async () => {
    mockGetLatestMessages
      .mockResolvedValueOnce(makePage([makeMessage({ id: 1, room_id: 10 })], 1, 20, 1))
      .mockResolvedValueOnce(makePage([makeMessage({ id: 99, room_id: 20 })], 1, 20, 1))

    const { result, rerender } = renderMessagesRoom(10)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.messages.map((m) => m.id)).toEqual([1])

    await act(async () => {
      rerender({ roomId: 20 })
    })

    await waitFor(() => expect(result.current.messages.map((m) => m.id)).toEqual([99]))
  })

  it("appends incoming real-time messages and dedupes by id", async () => {
    mockGetLatestMessages.mockResolvedValueOnce(makePage([makeMessage({ id: 1 })], 1, 20, 1))

    const { result } = renderMessagesRoom(10)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      mockChannelHandlers.onMessageReceived?.(makeMessage({ id: 2, body: "new" }))
      mockChannelHandlers.onMessageReceived?.(makeMessage({ id: 2, body: "duplicate" }))
    })

    expect(result.current.messages.map((m) => m.id)).toEqual([1, 2])
  })

  it("removes a message on delete event", async () => {
    mockGetLatestMessages.mockResolvedValueOnce(
      makePage([makeMessage({ id: 1 }), makeMessage({ id: 2 })], 1, 20, 2)
    )

    const { result } = renderMessagesRoom(10)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      mockChannelHandlers.onMessageDeleted?.(1)
    })

    expect(result.current.messages.map((m) => m.id)).toEqual([2])
  })

  it("sendMessage posts through chatService and appends the result", async () => {
    mockGetLatestMessages.mockResolvedValueOnce(makePage([], 1, 20, 0))
    mockSendMessage.mockResolvedValueOnce(makeMessage({ id: 42, body: "hi" }))

    const { result } = renderMessagesRoom(10)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let sent: MessageDto | undefined
    await act(async () => {
      sent = await result.current.sendMessage("hi")
    })

    expect(mockSendMessage).toHaveBeenCalledWith(10, { body: "hi", type: "text" })
    expect(sent?.id).toBe(42)
    expect(result.current.messages.map((m) => m.id)).toEqual([42])
  })

  it("sendMessage rejects when roomId is null", async () => {
    const { result } = renderMessagesRoom(null)
    await expect(result.current.sendMessage("x")).rejects.toThrow("No room selected")
  })

  it("loadMore prepends older pages", async () => {
    mockGetLatestMessages.mockResolvedValueOnce(makePage([makeMessage({ id: 21 })], 2, 20, 25))
    mockGetMessages.mockResolvedValueOnce({
      data: [makeMessage({ id: 1 })],
      meta: { current_page: 1, per_page: 20, total: 25, last_page: 2 },
    })

    const { result } = renderMessagesRoom(10)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasMore).toBe(true)

    await act(async () => {
      await result.current.loadMore()
    })

    expect(mockGetMessages).toHaveBeenCalledWith(10, 1)
    expect(result.current.messages.map((m) => m.id)).toEqual([1, 21])
    expect(result.current.hasMore).toBe(false)
  })

  it("refresh resets to latest page", async () => {
    mockGetLatestMessages
      .mockResolvedValueOnce(makePage([makeMessage({ id: 21 })], 2, 20, 25))
      .mockResolvedValueOnce(makePage([makeMessage({ id: 99 })], 1, 20, 1))
    mockGetMessages.mockResolvedValueOnce({
      data: [makeMessage({ id: 1 })],
      meta: { current_page: 1, per_page: 20, total: 25, last_page: 2 },
    })

    const { result } = renderMessagesRoom(10)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.loadMore()
    })

    await act(async () => {
      await result.current.refresh()
    })
    expect(result.current.messages.map((m) => m.id)).toEqual([99])
  })
})
