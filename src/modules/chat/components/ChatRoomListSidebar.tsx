"use client"

import { useTranslations } from "next-intl"
import { MessageSquare, Plus } from "lucide-react"

import { Button } from "components/ui/button"
import { ChatRoomList as LegacyChatRoomList } from "components/features/chat/chat-room-list"
import type { ChatRoomDto } from "@/types/chat"

export interface ChatRoomListSidebarProps {
  rooms: ChatRoomDto[]
  activeRoomId: number | null
  isLoading: boolean
  onSelectRoom: (roomId: number) => void
  onCreateRoom: () => void
  className?: string
}

export function ChatRoomListSidebar({
  rooms,
  activeRoomId,
  isLoading,
  onSelectRoom,
  onCreateRoom,
  className,
}: ChatRoomListSidebarProps) {
  const t = useTranslations("chat")
  return (
    <aside
      className={
        "flex h-full w-full flex-col border-e bg-card md:w-80 " + (className ?? "")
      }
    >
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="font-bold text-base">{t("title")}</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateRoom}
          className="rounded-lg"
        >
          <Plus className="size-4 me-1.5" />
          {t("newRoom")}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading && rooms.length === 0 ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
            <MessageSquare className="size-6" aria-hidden />
            <p>{t("noRooms")}</p>
          </div>
        ) : (
          <LegacyChatRoomList
            rooms={rooms}
            activeRoomId={activeRoomId}
            onSelectRoom={onSelectRoom}
          />
        )}
      </div>
    </aside>
  )
}