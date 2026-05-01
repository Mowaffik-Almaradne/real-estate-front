"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ChatRoomList } from "@/components/features/chat/chat-room-list"
import { useChatRoomsReact } from "@/hooks/use-chat-rooms-react"
import { chatService } from "lib/chat-service"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "components/layout/DashboardLayout"
import type { MessageDto, PaginatedMessages } from "src/types/chat"
import { toast } from "sonner"

export default function ChatPage() {
  const searchParams = useSearchParams()
  const roomIdParam = searchParams.get("room")
  const { rooms, loading, error } = useChatRoomsReact()
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [showNewRoomForm, setShowNewRoomForm] = useState(false)
  const [messages, setMessages] = useState<MessageDto[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (roomIdParam) {
      setSelectedRoomId(Number(roomIdParam))
    }
  }, [roomIdParam])

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedRoomId) {
        try {
          setLoadingMessages(true)
          const data: PaginatedMessages = await chatService.getMessages(selectedRoomId)
          setMessages([...data.data])
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
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoomId) return

    try {
      setSending(true)
      await chatService.sendMessage(selectedRoomId, newMessage)
      const data: PaginatedMessages = await chatService.getMessages(selectedRoomId)
      setMessages([...data.data])
      setNewMessage("")
      toast.success("Message sent")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardLayout title="Chat">
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-80 border-r bg-background flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="font-semibold text-lg">Chat</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewRoomForm(!showNewRoomForm)}
            >
              <MessageSquare className="size-4 mr-1" />
              New
            </Button>
          </div>
          
          {showNewRoomForm && (
            <div className="p-4 border-b bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">
                Create new chat coming soon...
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
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

        <div className="flex-1 flex flex-col">
          {selectedRoomId ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-background">
                <h2 className="font-semibold">
                  Chat Room #{selectedRoomId}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="size-12 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Send one to start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id
                    const isOwnMessage = message.sender?.id === currentUserId
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.body}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
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
              <div className="text-center">
                <MessageSquare className="size-16 mx-auto mb-4 opacity-30" />
                <h2 className="text-xl font-semibold mb-2">Welcome to Chat</h2>
                <p>Select a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}