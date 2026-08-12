"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { chatService } from "@/services/chat-service"
import { useChatChannel } from "@/hooks/use-chat-channel"
import { getEcho, getPusherConnection } from "@/lib/echo"
import type { MessageDto, MessageType, SendMessageRequest } from "@/types/chat"

export interface UseMessagesResult {
  messages: MessageDto[]
  isLoading: boolean
  isLoadingMore: boolean
  isConnected: boolean
  hasMore: boolean
  error: string | null
  sendMessage: (
    body: string,
    type?: MessageType,
    extras?: Partial<Pick<SendMessageRequest, "attachment_url" | "reply_to_id">>
  ) => Promise<MessageDto>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

interface FetchState {
  messages: MessageDto[]
  hasMore: boolean
  page: number
  isLoading: boolean
  error: string | null
}

const INITIAL_FETCH_STATE: FetchState = {
  messages: [],
  hasMore: false,
  page: 1,
  isLoading: false,
  error: null,
}

function sortByIdAsc(messages: MessageDto[]): MessageDto[] {
  return [...messages].sort((a, b) => a.id - b.id)
}

export function useMessages(roomId: number | null): UseMessagesResult {
  const [state, setState] = useState<FetchState>(INITIAL_FETCH_STATE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const roomIdRef = useRef<number | null | undefined>(undefined)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const echo = getEcho()
    const pusher = getPusherConnection(echo)
    if (!pusher) return

    const handleStateChange = () => {
      setIsConnected(pusher.connection.state === "connected")
    }

    pusher.connection.bind("state_change", handleStateChange)
    handleStateChange()

    return () => {
      pusher.connection.unbind("state_change", handleStateChange)
    }
  }, [])

  useEffect(() => {
    const previousRoomId = roomIdRef.current
    roomIdRef.current = roomId

    if (roomId === null) {
      if (previousRoomId !== undefined && previousRoomId !== null) {
        setState(INITIAL_FETCH_STATE)
      }
      return
    }

    if (previousRoomId === roomId) return

    let cancelled = false
    setState({ ...INITIAL_FETCH_STATE, isLoading: true })

    const fetchInitial = async () => {
      try {
        const data = await chatService.getLatestMessages(roomId)
        if (cancelled) return
        setState({
          messages: sortByIdAsc([...data.data]),
          hasMore: data.page > 1,
          page: data.page,
          isLoading: false,
          error: null,
        })
      } catch (err) {
        if (cancelled) return
        setState({
          ...INITIAL_FETCH_STATE,
          error: err instanceof Error ? err.message : "Failed to load messages",
        })
      }
    }

    void fetchInitial()

    return () => {
      cancelled = true
    }
  }, [roomId])

  const handleMessageReceived = useCallback((msg: MessageDto) => {
    setState((prev) => {
      if (prev.messages.some((m) => m.id === msg.id)) return prev
      return { ...prev, messages: sortByIdAsc([...prev.messages, msg]) }
    })
  }, [])

  const handleMessageDeleted = useCallback((messageId: number) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== messageId),
    }))
  }, [])

  const handleUserTyping = useCallback(() => {}, [])

  useChatChannel({
    roomId,
    onMessageReceived: handleMessageReceived,
    onMessageDeleted: handleMessageDeleted,
    onUserTyping: handleUserTyping,
  })

  const sendMessage = useCallback(
    async (
      body: string,
      type: MessageType = "text",
      extras?: Partial<Pick<SendMessageRequest, "attachment_url" | "reply_to_id">>
    ): Promise<MessageDto> => {
      if (roomId === null) {
        throw new Error("No room selected")
      }

      const trimmed = body.trim()
      if (!trimmed) {
        throw new Error("Message body cannot be empty")
      }

      try {
        const sent = await chatService.sendMessage(roomId, {
          body: trimmed,
          type,
          ...extras,
        })
        setState((prev) => {
          if (prev.messages.some((m) => m.id === sent.id)) return prev
          return { ...prev, messages: sortByIdAsc([...prev.messages, sent]) }
        })
        return sent
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message"
        setState((prev) => ({ ...prev, error: message }))
        throw err
      }
    },
    [roomId]
  )

  const loadMore = useCallback(async () => {
    if (roomId === null || isLoadingMore || !stateRef.current.hasMore) return
    if (stateRef.current.page <= 1) return

    try {
      setIsLoadingMore(true)
      const olderPage = stateRef.current.page - 1
      const data = await chatService.getMessages(roomId, olderPage)
      setState((prev) => {
        const existing = new Set(prev.messages.map((m) => m.id))
        const incoming = data.data.filter((m) => !existing.has(m.id))
        return {
          ...prev,
          messages: sortByIdAsc([...incoming, ...prev.messages]),
          page: olderPage,
          hasMore: olderPage > 1,
        }
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to load more messages",
      }))
    } finally {
      setIsLoadingMore(false)
    }
  }, [roomId, isLoadingMore])

  const refresh = useCallback(async () => {
    if (roomId === null) return

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const data = await chatService.getLatestMessages(roomId)
      setState({
        messages: sortByIdAsc([...data.data]),
        hasMore: data.page > 1,
        page: data.page,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load messages",
      }))
    }
  }, [roomId])

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isLoadingMore,
    isConnected,
    hasMore: state.hasMore,
    error: state.error,
    sendMessage,
    loadMore,
    refresh,
  }
}
