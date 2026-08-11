"use client"

import { ChevronLeft, Users } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "components/ui/button"
import { ConnectionStatus } from "src/components/features/chat/connection-status"
import type { ChatRoomDto } from "@/types/chat"

export interface ChatHeaderProps {
  room: ChatRoomDto
  currentUserId: number | null
  isConnected: boolean
  onBack: () => void
  onShowInfo?: () => void
  className?: string
}

export function ChatHeader({
  room,
  currentUserId,
  isConnected,
  onBack,
  className,
}: ChatHeaderProps) {
  const t = useTranslations("chat")
  const tCommon = useTranslations("common")
  const otherParticipants = room.participants.filter((p) => p.id !== currentUserId)
  const displayName =
    room.name ||
    (room.type === "private"
      ? otherParticipants[0]?.name ?? tCommon("chat")
      : otherParticipants.map((p) => p.name).join(", "))

  return (
    <header
      className={
        "flex items-center justify-between gap-3 border-b bg-background px-4 py-3 " +
        (className ?? "")
      }
    >
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label={t("back")}
          className="md:hidden"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </Button>
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {room.type === "group" ? (
              <>
                <Users className="size-3" aria-hidden />
                {t("participants", { count: room.participants.length })}
              </>
            ) : (
              <ConnectionStatus isConnected={isConnected} />
            )}
          </p>
        </div>
      </div>
    </header>
  )
}