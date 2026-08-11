"use client"

import { Check, CheckCheck, Download, FileText, Loader2, X } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { Button } from "components/ui/button"
import { cn } from "@/lib/utils"
import type { MessageDto } from "@/types/chat"
import { isImageMime } from "@/types/chat"

export interface MessageBubbleProps {
  message: MessageDto
  isMine: boolean
  showSender?: boolean
  onReply?: (message: MessageDto) => void
  onDelete?: (message: MessageDto) => void
  showReadReceipt?: boolean
  className?: string
}

export function MessageBubble({
  message,
  isMine,
  showSender = false,
  onReply,
  onDelete,
  showReadReceipt = false,
  className,
}: MessageBubbleProps) {
  const t = useTranslations("chat")

  const isImage = message.type === "image" || isImageMime(message.attachment_mime)
  const hasAttachment = Boolean(message.attachment_url) || isImage

  return (
    <article
      className={cn(
        "group flex max-w-[80%] flex-col gap-1",
        isMine ? "ms-auto items-end" : "items-start",
        className
      )}
      data-testid={`message-${message.id}`}
      data-sender={isMine ? "me" : "other"}
    >
      {showSender && !isMine && (
        <p className="px-1 text-xs font-medium text-muted-foreground">
          {message.sender.name}
        </p>
      )}

      {message.reply_to && (
        <ReplyHeader
          sender={message.reply_to.sender_name}
          body={message.reply_to.body}
          attachmentUrl={message.reply_to.attachment_url}
        />
      )}

      <div
        className={cn(
          "rounded-2xl px-3 py-2 text-sm shadow-sm",
          isMine
            ? "gradient-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {hasAttachment && message.attachment_url && (
          <AttachmentPreview
            url={message.attachment_url}
            mime={message.attachment_mime ?? null}
            name={message.attachment_name ?? t("attachment")}
            isImage={isImage}
          />
        )}
        {message.body && !isImage && (
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        )}
      </div>

      <footer
        className={cn(
          "flex items-center gap-2 px-1 text-[10px] text-muted-foreground",
          isMine && "flex-row-reverse"
        )}
      >
        <time dateTime={message.created_at}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
        {showReadReceipt && isMine && (
          <span aria-label={message.read_at ? t("read") : t("delivered")}>
            {message.read_at ? (
              <CheckCheck className="size-3 text-primary" aria-hidden />
            ) : (
              <Check className="size-3" aria-hidden />
            )}
          </span>
        )}
      </footer>

      {(onReply || onDelete) && (
        <div
          className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            isMine ? "flex-row-reverse" : ""
          )}
        >
          {onReply && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onReply(message)}
              aria-label={t("reply")}
            >
              <X className="size-3.5 rotate-90" aria-hidden />
            </Button>
          )}
          {isMine && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(message)}
              aria-label={t("delete")}
            >
              <X className="size-3.5" aria-hidden />
            </Button>
          )}
        </div>
      )}
    </article>
  )
}

function AttachmentPreview({
  url,
  mime,
  name,
  isImage,
}: {
  url: string
  mime: string | null
  name: string
  isImage: boolean
}) {
  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="block overflow-hidden rounded-lg"
      >
        <div className="relative h-48 w-72 max-w-full">
          <Image
            src={url}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            className="object-cover"
          />
        </div>
      </a>
    )
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      download={name}
      className="flex items-center gap-2 rounded-md bg-background/20 p-2 text-xs hover:bg-background/40"
    >
      <FileText className="size-4" aria-hidden />
      <span className="flex-1 truncate font-medium">{name}</span>
      <Download className="size-3.5" aria-hidden />
      <span className="sr-only">{mime ?? ""}</span>
    </a>
  )
}

function ReplyHeader({
  sender,
  body,
  attachmentUrl,
}: {
  sender: string
  body: string
  attachmentUrl?: string | null
}) {
  return (
    <div className="flex max-w-full flex-col gap-0.5 rounded-lg border-l-2 border-primary/50 bg-muted/50 px-2 py-1 text-xs">
      <p className="font-medium text-primary">{sender}</p>
      <p className="line-clamp-1 text-muted-foreground">
        {attachmentUrl ? `📎 ${body}` : body}
      </p>
    </div>
  )
}

export function MessageBubbleSkeleton({ isMine = false }: { isMine?: boolean }) {
  return (
    <div
      className={cn(
        "flex max-w-[80%] flex-col gap-1",
        isMine ? "ms-auto items-end" : "items-start"
      )}
    >
      <div className="h-10 w-48 animate-pulse rounded-2xl bg-muted" />
      <Loader2 className="size-3 animate-spin opacity-0" aria-hidden />
    </div>
  )
}