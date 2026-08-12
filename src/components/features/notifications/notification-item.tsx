"use client"

import { MessageCircle, Home, Bell, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNotificationCategory } from "@/types/notification"
import type { NotificationDto } from "@/types/notification"

interface NotificationItemProps {
  notification: NotificationDto
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
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

  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin} minutes ago`
  if (diffHour < 24) return `${diffHour} hours ago`
  if (diffDay < 7) return `${diffDay} days ago`
  return date.toLocaleDateString()
}

function getNotificationHref(notification: NotificationDto): string {
  const category = getNotificationCategory(notification.type)
  const data = notification.data as Record<string, unknown> | null

  if (category === "message" && data?.room_id) {
    return `/chat?room=${data.room_id}`
  }

  if (category === "property" && data?.property_id) {
    return `/properties/${data.property_id}`
  }

  return "#"
}

function extractTitle(notification: NotificationDto): string {
  return notification.title ?? ""
}

function extractDescription(notification: NotificationDto): string {
  const data = notification.data as Record<string, unknown> | null

  if (data?.message) {
    return String(data.message)
  }

  if (data?.description) {
    return String(data.description)
  }

  return notification.message ?? notification.body ?? ""
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  className,
}: NotificationItemProps) {
  const category = getNotificationCategory(notification.type)
  const isUnread = notification.read_at === null
  const href = getNotificationHref(notification)

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3 transition-colors",
        "hover:bg-accent/50",
        isUnread && "bg-accent/30",
        className
      )}
      style={isUnread ? { borderLeft: "3px solid var(--color-primary)" } : {}}
    >
      <div
        className={cn(
          "flex size-9 flex-shrink-0 items-center justify-center rounded-full",
          category === "message" && "bg-blue-500/10 text-blue-500",
          category === "property" && "bg-emerald-500/10 text-emerald-500",
          category === "system" && "bg-amber-500/10 text-amber-500"
        )}
      >
        {category === "message" ? (
          <MessageCircle className="size-4" />
        ) : category === "property" ? (
          <Home className="size-4" />
        ) : (
          <Bell className="size-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <a href={href} className="block">
          <p className={cn("truncate text-sm font-medium", isUnread && "font-semibold")}>
            {extractTitle(notification)}
          </p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {extractDescription(notification)}
          </p>
        </a>

        <p className="mt-1 text-xs text-muted-foreground">
          {getRelativeTime(notification.created_at)}
        </p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUnread && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onMarkRead(notification.id)
            }}
            className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
            title="Mark as read"
          >
            <Check className="size-4 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            onDelete(notification.id)
          }}
          className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
          title="Delete"
        >
          <Trash2 className="size-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}