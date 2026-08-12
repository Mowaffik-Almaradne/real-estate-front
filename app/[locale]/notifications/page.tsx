"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  CalendarCheck,
  CheckCheck,
  Loader2,
  MessageSquare,
  Package,
  SearchX,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { cn } from "@/lib/utils"
import { useNotificationsReact } from "@/hooks/use-notifications-react"
import { getNotificationCategory, type NotificationDto } from "@/types/notification"
import { NotificationType } from "@/types/enums"

type Filter = "all" | "unread" | "message" | "property" | "system"

const FILTER_VALUES: Filter[] = ["all", "unread", "message", "property", "system"]

function iconFor(type: string) {
  const category = getNotificationCategory(type)
  if (category === "message") return MessageSquare
  if (category === "property") return Package
  if (type === NotificationType.booking_confirmed) return CalendarCheck
  return Bell
}

function linkFor(notification: NotificationDto): string | null {
  const data = notification.data ?? {}
  if (data.property_id) return `/properties/${data.property_id}`
  if (data.chat_room_id) return `/chat?room=${data.chat_room_id}`
  if (data.viewing_id) return `/dashboard/viewings`
  return null
}

export default function NotificationsPage() {
  const router = useRouter()
  const t = useTranslations("notifications")
  const tCommon = useTranslations("common")
  const [filter, setFilter] = useState<Filter>("all")
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
  } = useNotificationsReact()
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const filtered = useMemo(() => {
    if (filter === "all") return notifications
    if (filter === "unread") return notifications.filter((n) => !n.read_at)
    return notifications.filter((n) => {
      const category = getNotificationCategory(n.type)
      return category === filter
    })
  }, [filter, notifications])

  const handleClick = useCallback(
    (notification: NotificationDto) => {
      if (!notification.read_at) markAsRead(notification.id)
      const href = linkFor(notification)
      if (href) router.push(href)
    },
    [markAsRead, router]
  )

  const handleDelete = useCallback(
    (notification: NotificationDto) => {
      const previous = notifications
      deleteNotification(notification.id)
      toast(t("deleted"), {
        action: {
          label: t("undo"),
          onClick: () => {
            void fetch("/api/__noop__", { method: "POST" }).catch(() => undefined)
            void previous
          },
        },
      })
    },
    [deleteNotification, notifications, t]
  )

  const handleMarkAll = useCallback(() => {
    if (unreadCount === 0) return
    markAllAsRead()
    toast.success(t("allMarkedRead"))
  }, [markAllAsRead, t, unreadCount])

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleMarkAll}
        disabled={unreadCount === 0}
      >
        <CheckCheck className="size-4" />
        {t("markAllRead")}
      </Button>
    </div>
  )

  const isEmpty = !isLoading && filtered.length === 0

  return (
    <DashboardLayout title={t("title")} actions={headerActions}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { count: unreadCount })}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
          {FILTER_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-pressed={filter === value}
            >
              {t(`filter.${value}`)}
              {value === "unread" && unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {isLoading && notifications.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : isEmpty ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center text-sm text-muted-foreground">
              {filter === "unread" ? (
                <>
                  <CheckCheck className="size-7" aria-hidden />
                  <p className="font-medium">{t("allCaughtUp")}</p>
                  <p className="text-xs">{t("allCaughtUpHint")}</p>
                </>
              ) : (
                <>
                  <SearchX className="size-7" aria-hidden />
                  <p className="font-medium">{t("empty")}</p>
                  <p className="text-xs">{t("emptyHint")}</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <ul className="divide-y rounded-lg border bg-card">
            {filtered.map((notification) => {
              const Icon = iconFor(notification.type)
              const unread = !notification.read_at
              return (
                <li
                  key={notification.id}
                  className={cn(
                    "group flex items-start gap-3 p-4 transition-colors",
                    unread && "bg-primary/5"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleClick(notification)}
                    className="flex flex-1 items-start gap-3 text-start"
                    aria-label={notification.title ?? undefined}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 flex-shrink-0 items-center justify-center rounded-full",
                        unread
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {unread && (
                          <span className="inline-flex size-2 rounded-full bg-primary" aria-label="Unread" />
                        )}
                        <p className="text-sm font-medium">
                          {notification.title ?? t("defaultTitle")}
                        </p>
                      </div>
                      {(notification.body ?? notification.message) && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.body ?? notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        <time dateTime={notification.created_at}>
                          {new Date(notification.created_at).toLocaleString()}
                        </time>
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(notification)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={t("delete")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {hasMore && (
          <div
            ref={loaderRef}
            className="flex items-center justify-center py-6 text-sm text-muted-foreground"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                {tCommon("loading")}
              </span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => void loadMore()}>
                {t("loadMore")}
                <Sparkles className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
