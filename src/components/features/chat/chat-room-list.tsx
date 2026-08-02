"use client"

import { ChatRoomDto } from "@/types/chat"
import { getCurrentUserId } from "@/lib/auth-utils"

interface ChatRoomListProps {
  rooms: ChatRoomDto[]
  activeRoomId: number | null
  onSelectRoom: (roomId: number) => void
  className?: string
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return "now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getRoomDisplayName(room: ChatRoomDto, currentUserId: number): string {
  if (room.name) return room.name

  if (room.type === "private") {
    const otherParticipant = room.participants.find((p) => p.id !== currentUserId)
    return otherParticipant?.name || "Unknown"
  }

  return "Group Chat"
}

function getRoomAvatar(room: ChatRoomDto, currentUserId: number): {
  imageUrl?: string
  initials?: string
} {
  if (room.type === "private") {
    const otherParticipant = room.participants.find((p) => p.id !== currentUserId)
    if (otherParticipant?.avatar_url) {
      return { imageUrl: otherParticipant.avatar_url }
    }
    return { initials: getInitials(otherParticipant?.name || "?") }
  }

  return { initials: getInitials(room.name || "GC") }
}

function getLastMessagePreview(room: ChatRoomDto): string {
  if (!room.last_message) return "No messages yet"

  const prefix = room.last_message.type === "image" ? "📷 Image" : room.last_message.type === "file" ? "📎 File" : ""

  return prefix ? `${prefix}: ${room.last_message.body}` : room.last_message.body
}

export function ChatRoomList({
  rooms,
  activeRoomId,
  onSelectRoom,
  className,
}: ChatRoomListProps) {
  const currentUserId = getCurrentUserId()

  return (
    <div className={className}>
      {rooms.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No conversations yet
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto max-h-full">
          {rooms.map((room) => {
            const isActive = activeRoomId === room.id
            const displayName = getRoomDisplayName(room, currentUserId)
            const avatar = getRoomAvatar(room, currentUserId)

            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`
                  w-full flex items-center gap-3 p-3 text-left transition-colors
                  hover:bg-accent
                  ${isActive ? "bg-accent" : ""}
                `}
              >
                <div className="relative flex-shrink-0">
                  {avatar.imageUrl ? (
                    <img
                      src={avatar.imageUrl}
                      alt={displayName}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {avatar.initials}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`
                        truncate font-medium
                        ${room.unread_count > 0 ? "font-semibold" : ""}
                      `}
                    >
                      {displayName}
                    </span>
                    {room.last_message && (
                      <span className="flex-shrink-0 text-xs text-muted-foreground">
                        {getRelativeTime(room.last_message.created_at)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-muted-foreground">
                      {getLastMessagePreview(room)}
                    </span>
                    {room.unread_count > 0 && (
                      <span className="flex-shrink-0 flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                        {room.unread_count > 99 ? "99+" : room.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
