"use client"

import { Suspense, useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { ChatRoomList } from "@/components/features/chat/chat-room-list"
import { ConnectionStatus } from "@/components/features/chat/connection-status"
import { useChatRoomsReact } from "@/hooks/use-chat-rooms-react"
import { useChatChannel } from "@/hooks/use-chat-channel"
import { chatService } from "@/services/chat-service"
import { getCurrentUserId } from "@/lib/auth-utils"
import { getEcho, getPusherConnection } from "@/lib/echo"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import type { MessageDto, PaginatedMessages, ParticipantDto } from "@/types/chat"
import { toast } from "sonner"

function ChatContent() {
  const searchParams = useSearchParams()
  const roomIdParam = searchParams.get("room")
  const { rooms, isLoading, error, moveRoomToTop } = useChatRoomsReact()
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [showNewRoomForm, setShowNewRoomForm] = useState(false)
  const [messages, setMessages] = useState<MessageDto[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (roomIdParam) {
      setSelectedRoomId(Number(roomIdParam))
    }
  }, [roomIdParam])

  useEffect(() => {
    const echo = getEcho()
    const pusher = getPusherConnection(echo)
    if (!pusher) return

    const handleConnectionChange = () => {
      setIsConnected(pusher.connection.state === "connected")
    }

    pusher.connection.bind("connected", handleConnectionChange)
    pusher.connection.bind("disconnected", handleConnectionChange)
    pusher.connection.bind("unavailable", handleConnectionChange)
    setIsConnected(pusher.connection.state === "connected")

    return () => {
      pusher.connection.unbind("connected", handleConnectionChange)
      pusher.connection.unbind("disconnected", handleConnectionChange)
      pusher.connection.unbind("unavailable", handleConnectionChange)
    }
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedRoomId) {
        try {
          setLoadingMessages(true)
          setCurrentPage(1)
          const data: PaginatedMessages = await chatService.getMessages(selectedRoomId)
          setMessages([...data.data])
          setHasMoreMessages(data.meta.current_page * data.meta.per_page < data.meta.total)
        } catch (error) {
          console.error("Failed to fetch messages:", error)
        } finally {
          setLoadingMessages(false)
        }
      }
    }
    fetchMessages()
  }, [selectedRoomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const handleLoadMoreMessages = useCallback(async () => {
    if (!selectedRoomId || loadingMoreMessages || !hasMoreMessages) return

    try {
      setLoadingMoreMessages(true)
      const nextPage = currentPage + 1
      const data: PaginatedMessages = await chatService.getMessages(selectedRoomId, nextPage)
      setMessages((prev) => [...prev, ...data.data])
      setCurrentPage(nextPage)
      setHasMoreMessages(nextPage * data.meta.per_page < data.meta.total)
    } catch (error) {
      console.error("Failed to load more messages:", error)
    } finally {
      setLoadingMoreMessages(false)
    }
  }, [selectedRoomId, currentPage, loadingMoreMessages, hasMoreMessages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoomId) return

    const messageBody = newMessage.trim()
    setNewMessage("")

    try {
      setSending(true)
      const sentMessage = await chatService.sendMessage(selectedRoomId, {
        body: messageBody,
        type: "text",
      })
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMessage.id)) return prev
        return [sentMessage, ...prev]
      })
      moveRoomToTop(selectedRoomId, sentMessage)
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
      setNewMessage(messageBody)
    } finally {
      setSending(false)
    }
  }

  const handleMessageReceived = useCallback((msg: MessageDto) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [msg, ...prev]
    })
  }, [])

  const handleMessageDeleted = useCallback((messageId: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
  }, [])

  const handleUserTyping = useCallback((_user: ParticipantDto) => {
  }, [])

  useChatChannel({
    roomId: selectedRoomId,
    onMessageReceived: handleMessageReceived,
    onMessageDeleted: handleMessageDeleted,
    onUserTyping: handleUserTyping,
  })

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)
  const currentUserId = getCurrentUserId()
  const roomDisplayName = selectedRoom
    ? selectedRoom.name || (selectedRoom.type === "private"
        ? selectedRoom.participants.find((p) => p.id !== currentUserId)?.name || "Unknown"
        : "Group Chat")
    : ""

  return (
    <DashboardLayout title="Chat">
      <div className="flex h-[calc(100vh-4rem)] -m-4 lg:-m-6 xl:-m-8">
        <div className="w-80 border-r border-border/50 bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h1 className="font-bold text-base">Messages</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewRoomForm(!showNewRoomForm)}
              className="rounded-lg"
            >
              <MessageSquare className="size-4 mr-1.5" />
              New
            </Button>
          </div>
          
          {showNewRoomForm && (
            <div className="p-4 border-b border-border/50 bg-primary/5">
              <p className="text-sm text-muted-foreground">
                Create new chat coming soon...
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">
                {error}
              </div>
            ) : (
              <ChatRoomList
                rooms={rooms}
                activeRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
              />
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-background">
          {selectedRoomId ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-border/50 glass flex items-center justify-between">
                <h2 className="font-bold">
                  {roomDisplayName || `Chat Room #${selectedRoomId}`}
                </h2>
                <ConnectionStatus isConnected={isConnected} />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={messagesContainerRef}>
                {hasMoreMessages && (
                  <div className="text-center py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadMoreMessages}
                      disabled={loadingMoreMessages}
                    >
                      {loadingMoreMessages ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : null}
                      {loadingMoreMessages ? "Loading..." : "Load earlier messages"}
                    </Button>
                  </div>
                )}
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <div className="flex items-center justify-center size-16 rounded-2xl bg-accent/50 mx-auto mb-4">
                        <MessageSquare className="size-8 text-primary" />
                      </div>
                      <p className="font-medium text-foreground mb-1">No messages yet</p>
                      <p className="text-sm">Send one to start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.sender?.id === currentUserId
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isOwnMessage
                              ? "gradient-primary text-primary-foreground rounded-br-md"
                              : "bg-card border border-border/50 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.body}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? "opacity-70" : "text-muted-foreground"}`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-border/50 glass">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl h-11"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={sending || !newMessage.trim()} className="rounded-xl h-11 w-11">
                    {sending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center stagger-children-sm">
                <div className="flex items-center justify-center size-20 rounded-2xl bg-accent/30 mx-auto mb-4">
                  <MessageSquare className="size-10 text-primary/50" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Welcome to Chat</h2>
                <p className="text-muted-foreground">Select a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ChatContent />
    </Suspense>
  )
}
