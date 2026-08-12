"use client"

import { useEffect, useMemo, useRef } from "react"
import { Loader2, MessageSquare } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "components/ui/button"
import { MessageBubble, MessageBubbleSkeleton } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import { cn } from "@/lib/utils"
import type { MessageDto, ReplyReference } from "@/types/chat"

export interface MessageListProps {
  messages: MessageDto[]
  currentUserId: number | null
  typingUsers: string[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  onReply: (message: MessageDto) => void
  onDelete: (message: MessageDto) => void
  className?: string
}

export function MessageList({
  messages,
  currentUserId,
  typingUsers,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onReply,
  onDelete,
  className,
}: MessageListProps) {
  const t = useTranslations("chat")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const grouped = useMemo(() => {
    return messages.map((msg, i) => {
      const previous = messages[i - 1]
      const showSender =
        !previous || previous.sender.id !== msg.sender.id || msg.sender.id === currentUserId
      return { message: msg, showSender }
    })
  }, [messages, currentUserId])

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages.length])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore()
        }
      },
      { root: containerRef.current, rootMargin: "120px" }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, onLoadMore])

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto px-4 py-3",
        className
      )}
    >
      {isLoading && messages.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <MessageBubbleSkeleton key={i} isMine={i % 2 === 0} />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <MessageSquare className="size-7" aria-hidden />
            <p className="font-medium">{t("empty")}</p>
            <p className="text-xs">{t("emptyHint")}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hasMore && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  t("loadMore")
                )}
              </Button>
            </div>
          )}
          {grouped.map(({ message, showSender }) => {
            const isMine = message.sender.id === currentUserId
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isMine={isMine}
                showSender={!showSender}
                onReply={onReply}
                onDelete={onDelete}
                showReadReceipt={isMine}
              />
            )
          })}
          <TypingIndicator users={typingUsers} />
          <div ref={sentinelRef} />
        </div>
      )}
    </div>
  )
}

export function toReplyReference(message: MessageDto): ReplyReference {
  return {
    id: message.id,
    sender_name: message.sender.name,
    body: message.body,
    type: message.type,
    attachment_url: message.attachment_url ?? null,
  }
}