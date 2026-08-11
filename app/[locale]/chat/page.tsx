"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { MessageSquare } from "lucide-react"

import { DashboardLayout } from "components/layout/DashboardLayout"
import { chatService } from "@/services/chat-service"
import { useChatRoomsReact } from "@/hooks/use-chat-rooms-react"
import { useMessages } from "@/hooks/use-messages"
import { getCurrentUserId } from "@/lib/auth-utils"
import { ChatRoomListSidebar } from "src/modules/chat/components/ChatRoomListSidebar"
import { ChatHeader } from "src/modules/chat/components/ChatHeader"
import { MessageList, toReplyReference } from "src/modules/chat/components/MessageList"
import {
  MessageComposer,
  useTypingEmitter,
} from "src/modules/chat/components/MessageComposer"
import type { MessageDto, ReplyReference } from "@/types/chat"

function ChatContent() {
  const searchParams = useSearchParams()
  const t = useTranslations("chat")
  const tCommon = useTranslations("common")
  const roomIdParam = searchParams.get("room")
  const { rooms, isLoading, error, moveRoomToTop } = useChatRoomsReact()
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    roomIdParam ? Number(roomIdParam) : null
  )
  const [replyTo, setReplyTo] = useState<ReplyReference | null>(null)
  const currentUserId = getCurrentUserId()
  const typingEmit = useTypingEmitter(selectedRoomId)

  const {
    messages,
    isLoading: loadingMessages,
    isLoadingMore: loadingMoreMessages,
    isConnected,
    hasMore: hasMoreMessages,
    sendMessage: sendMessageRequest,
    loadMore: handleLoadMoreMessages,
  } = useMessages(selectedRoomId)

  useEffect(() => {
    if (!selectedRoomId) return
    void chatService.markRoomAsRead(selectedRoomId).catch(() => undefined)
  }, [selectedRoomId, messages.length])

  const handleSend = useCallback(
    async (params: {
      body: string
      type: "text" | "image" | "file"
      attachmentUrl?: string
      attachmentName?: string
      attachmentMime?: string
      attachmentSize?: number
      thumbUrl?: string
      replyTo?: ReplyReference
    }) => {
      if (!selectedRoomId) return
      try {
        const sent = await sendMessageRequest(params.body, params.type)
        moveRoomToTop(selectedRoomId, sent)
        setReplyTo(null)
      } catch {
        toast.error(tCommon("error"))
      }
    },
    [selectedRoomId, sendMessageRequest, moveRoomToTop, tCommon]
  )

  const handleDelete = useCallback(
    async (message: MessageDto) => {
      if (!selectedRoomId) return
      try {
        await chatService.deleteMessage(selectedRoomId, message.id)
      } catch {
        toast.error(tCommon("error"))
      }
    },
    [selectedRoomId, tCommon]
  )

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  return (
    <DashboardLayout title={t("title")}>
      <div className="-m-4 flex h-[calc(100vh-4rem)] lg:-m-6 xl:-m-8">
        <ChatRoomListSidebar
          rooms={rooms}
          activeRoomId={selectedRoomId}
          isLoading={isLoading}
          onSelectRoom={setSelectedRoomId}
          onCreateRoom={() => toast.info(t("newRoom"))}
        />

        <div className="hidden flex-1 flex-col bg-background md:flex">
          {selectedRoomId && selectedRoom ? (
            <>
              <ChatHeader
                room={selectedRoom}
                currentUserId={currentUserId}
                isConnected={isConnected}
                onBack={() => setSelectedRoomId(null)}
              />
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                typingUsers={[]}
                isLoading={loadingMessages}
                isLoadingMore={loadingMoreMessages}
                hasMore={hasMoreMessages}
                onLoadMore={handleLoadMoreMessages}
                onReply={(msg) => setReplyTo(toReplyReference(msg))}
                onDelete={handleDelete}
              />
              <MessageComposer
                roomId={selectedRoomId}
                onSend={handleSend}
                onTyping={typingEmit}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-accent/30">
                  <MessageSquare className="size-10 text-primary/50" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-foreground">{t("title")}</h2>
                <p>{t("selectRoom")}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col bg-background md:hidden">
          {selectedRoomId && selectedRoom ? (
            <>
              <ChatHeader
                room={selectedRoom}
                currentUserId={currentUserId}
                isConnected={isConnected}
                onBack={() => setSelectedRoomId(null)}
              />
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                typingUsers={[]}
                isLoading={loadingMessages}
                isLoadingMore={loadingMoreMessages}
                hasMore={hasMoreMessages}
                onLoadMore={handleLoadMoreMessages}
                onReply={(msg) => setReplyTo(toReplyReference(msg))}
                onDelete={handleDelete}
              />
              <MessageComposer
                roomId={selectedRoomId}
                onSend={handleSend}
                onTyping={typingEmit}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
              />
            </>
          ) : (
            <ChatRoomListSidebar
              rooms={rooms}
              activeRoomId={selectedRoomId}
              isLoading={isLoading}
              onSelectRoom={setSelectedRoomId}
              onCreateRoom={() => toast.info(t("newRoom"))}
            />
          )}
        </div>
      </div>
      {error && (
        <div className="absolute bottom-4 right-4 z-50 rounded-lg bg-destructive px-3 py-2 text-xs text-destructive-foreground">
          {error}
        </div>
      )}
    </DashboardLayout>
  )
}

export default function ChatPage() {
  const tCommon = useTranslations("common")
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">{tCommon("loading")}</div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}