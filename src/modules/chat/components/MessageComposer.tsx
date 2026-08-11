"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Paperclip, Send, Smile, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Textarea } from "components/ui/textarea"
import { cn } from "@/lib/utils"
import { chatService } from "@/services/chat-service"
import {
  ACCEPTED_FILE_TYPES,
  MAX_ATTACHMENT_SIZE,
  isAcceptedMime,
  isImageMime,
} from "@/types/chat"
import type {
  LocalAttachment,
  ReplyReference,
  UploadAttachmentResponse,
} from "@/types/chat"

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
  const [attachments, setAttachments] = useState<LocalAttachment[]>([])
  const [sending, setSending] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sentTypingRef = useRef(false)

  const canSend = useMemo(() => {
    if (sending || disabled) return false
    return body.trim().length > 0 || attachments.some((a) => a.status === "uploaded")
  }, [body, attachments, sending, disabled])

  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (a.preview) URL.revokeObjectURL(a.preview)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleTyping() {
    if (!onTyping || sentTypingRef.current) return
    onTyping()
    sentTypingRef.current = true
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      sentTypingRef.current = false
    }, 3000)
  }

  function processFiles(files: FileList | File[]) {
    if (!roomId) return
    const next: LocalAttachment[] = []
    for (const file of Array.from(files)) {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        toast.error(t("fileTooBig", { max: Math.round(MAX_ATTACHMENT_SIZE / 1024 / 1024) }))
        continue
      }
      if (!isAcceptedMime(file.type)) {
        toast.error(t("unsupportedType"))
        continue
      }
      const id = `att-${++attachmentIdCounter}`
      const preview = isImageMime(file.type) ? URL.createObjectURL(file) : undefined
      next.push({
        id,
        file,
        preview,
        status: "pending",
        progress: 0,
      })
    }
    if (next.length === 0) return
    setAttachments((prev) => [...prev, ...next])
    next.forEach((att) => {
      void uploadAttachment(roomId, att, (update) => {
        setAttachments((prev) =>
          prev.map((existing) =>
            existing.id === att.id ? { ...existing, ...update } : existing
          )
        )
      })
    })
  }

  async function uploadAttachment(
    roomId: number,
    att: LocalAttachment,
    onUpdate: (update: Partial<LocalAttachment>) => void
  ): Promise<void> {
    onUpdate({ status: "uploading", progress: 50 })
    try {
      const result: UploadAttachmentResponse = await chatService.uploadAttachment(
        roomId,
        att.file
      )
      onUpdate({
        status: "uploaded",
        progress: 100,
        uploadedUrl: result.url,
        uploadedName: result.name,
        uploadedMime: result.mime_type,
        uploadedSize: result.size,
        thumbUrl: result.thumb_url,
      })
    } catch (error) {
      onUpdate({ status: "error", error: error instanceof Error ? error.message : t("uploadFailed") })
      toast.error(t("uploadFailed"))
    }
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (files && files.length > 0) processFiles(files)
    event.target.value = ""
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragOver(false)
    if (event.dataTransfer.files?.length) {
      processFiles(event.dataTransfer.files)
    }
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id)
      if (target?.preview) URL.revokeObjectURL(target.preview)
      return prev.filter((a) => a.id !== id)
    })
  }

  async function handleSend() {
    if (!canSend) return
    const trimmedBody = body.trim()
    const uploaded = attachments.filter((a) => a.status === "uploaded")
    setSending(true)
    try {
      const type: "text" | "image" | "file" = uploaded.length > 0
        ? isImageMime(uploaded[0].uploadedMime ?? "")
          ? "image"
          : "file"
        : "text"

      await onSend({
        body: trimmedBody || (uploaded[0]?.uploadedName ?? ""),
        type,
        attachmentUrl: uploaded[0]?.uploadedUrl,
        attachmentName: uploaded[0]?.uploadedName,
        attachmentMime: uploaded[0]?.uploadedMime,
        attachmentSize: uploaded[0]?.uploadedSize,
        thumbUrl: uploaded[0]?.thumbUrl,
        replyTo: replyTo ?? undefined,
      })
      attachments.forEach((a) => {
        if (a.preview) URL.revokeObjectURL(a.preview)
      })
      setAttachments([])
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

      {attachments.length > 0 && (
        <ul className="mx-3 mt-2 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center gap-2 rounded-lg border bg-card px-2 py-1 text-xs"
            >
              {att.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={att.preview}
                  alt={att.file.name}
                  className="size-8 rounded object-cover"
                />
              ) : (
                <Paperclip className="size-4" aria-hidden />
              )}
              <span className="max-w-[12rem] truncate">{att.file.name}</span>
              {att.status === "uploading" && (
                <Loader2 className="size-3 animate-spin" aria-hidden />
              )}
              {att.status === "error" && (
                <span className="text-destructive">!</span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => removeAttachment(att.id)}
                aria-label={t("remove")}
              >
                <X className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(",")}
          multiple
          onChange={handleFileInput}
          className="hidden"
          aria-hidden
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
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