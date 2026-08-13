"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Loader2, Paperclip, Send, Smile, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Textarea } from "components/ui/textarea"
import { cn } from "@/lib/utils"
import { chatService } from "@/services/chat-service"
import type { ReplyReference } from "@/types/chat"

export interface MessageComposerProps {
  roomId: number | null
  onSend: (params: {
    body: string
    type: "text" | "image" | "file"
    attachmentUrl?: string
    attachmentName?: string
    attachmentMime?: string
    attachmentSize?: number
    thumbUrl?: string
    replyTo?: ReplyReference
  }) => Promise<void>
  onTyping?: () => void
  replyTo?: ReplyReference | null
  onCancelReply?: () => void
  disabled?: boolean
  className?: string
}

let attachmentIdCounter = 0

export function MessageComposer({
  roomId,
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
  className,
}: MessageComposerProps) {
  const t = useTranslations("chat")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sentTypingRef = useRef(false)

  const canSend = useMemo(() => {
    if (sending || disabled) return false
    return body.trim().length > 0
  }, [body, sending, disabled])

  function handleTyping() {
    if (!onTyping || sentTypingRef.current) return
    onTyping()
    sentTypingRef.current = true
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      sentTypingRef.current = false
    }, 3000)
  }

  function processFiles(_files: FileList | File[]) {
    // Backend has no `/chat/rooms/{id}/attachments` route yet.
    toast.error(t("uploadFailed"))
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragOver(false)
    if (event.dataTransfer.files?.length) {
      processFiles(event.dataTransfer.files)
    }
  }

  async function handleSend() {
    if (!canSend) return
    const trimmedBody = body.trim()
    setSending(true)
    try {
      await onSend({
        body: trimmedBody,
        type: "text",
        replyTo: replyTo ?? undefined,
      })
      setBody("")
      onCancelReply?.()
    } catch {
      // hook handles toast
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className={cn(
        "relative border-t bg-background",
        dragOver && "ring-2 ring-primary",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/5 text-sm font-medium text-primary">
          {t("dropHere")}
        </div>
      )}

      {replyTo && (
        <div className="mx-3 mt-2 flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">{t("replyingTo", { name: replyTo.sender_name })}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {replyTo.attachment_url ? `📎 ${replyTo.body}` : replyTo.body}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onCancelReply}
            aria-label={t("cancelReply")}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => toast.error(t("uploadFailed"))}
          disabled={disabled || !roomId}
          aria-label={t("attach")}
        >
          <Paperclip className="size-4" />
        </Button>

        <Textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            handleTyping()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              void handleSend()
            }
          }}
          placeholder={
            roomId
              ? replyTo
                ? t("replyPlaceholder")
                : t("placeholder")
              : t("selectRoom")
          }
          disabled={disabled || !roomId}
          rows={1}
          className="min-h-[40px] resize-none"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled
          aria-label={t("emoji")}
        >
          <Smile className="size-4" />
        </Button>

        <Button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          aria-label={t("send")}
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  )
}

export function useTypingEmitter(roomId: number | null) {
  const lastSentRef = useRef(0)
  return useCallback(() => {
    if (!roomId) return
    const now = Date.now()
    if (now - lastSentRef.current < 3000) return
    lastSentRef.current = now
    void chatService.sendTyping(roomId).catch(() => undefined)
  }, [roomId])
}