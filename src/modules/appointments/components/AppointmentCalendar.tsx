"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"

import { appointmentService } from "../services/appointmentsService"
import type { AppointmentCalendarEvent } from "../types"

interface AppointmentCalendarProps {
  onSelect?: (event: AppointmentCalendarEvent) => void
  refreshKey?: number
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function toIsoDate(date: Date): string {
  return formatDateKey(date)
}

export function AppointmentCalendar({ onSelect, refreshKey = 0 }: AppointmentCalendarProps) {
  const t = useTranslations()
  const [monthDate, setMonthDate] = useState<Date>(() => new Date())
  const [events, setEvents] = useState<AppointmentCalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    Promise.resolve().then(() => {
      setLoading(true)
      setError(null)
    })
    void appointmentService
      .getCalendar(toIsoDate(start), toIsoDate(end))
      .then((list) => {
        if (cancelled) return
        setEvents(list)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load calendar")
        setEvents([])
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [monthDate, refreshKey])

  const monthLabel = monthDate.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  })

  const weeks = buildMonthGrid(monthDate)
  const eventsByDay = groupEventsByDay(events)

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))
            }
            aria-label={t("common.previous") || "Previous"}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h3 className="text-sm font-semibold capitalize">{monthLabel}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))
            }
            aria-label={t("common.next") || "Next"}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : null}

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase text-muted-foreground">
          {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
            <div key={day} className="py-1">
              {t(`appointments.days.${day}`) || day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" data-testid="appointments-calendar-grid">
          {weeks.flat().map((day, idx) => {
            const inMonth = day.getMonth() === monthDate.getMonth()
            const key = formatDateKey(day)
            const dayEvents = eventsByDay.get(key) ?? []
            return (
              <button
                type="button"
                key={`${key}-${idx}`}
                onClick={() => dayEvents[0] && onSelect?.(dayEvents[0])}
                className={`flex min-h-[64px] flex-col items-start gap-1 rounded-md border p-1.5 text-left text-xs transition-colors ${
                  inMonth
                    ? "bg-card hover:bg-muted/50"
                    : "bg-muted/30 text-muted-foreground"
                }`}
                data-testid={`appointments-day-${key}`}
              >
                <span className="text-[10px] font-semibold">{day.getDate()}</span>
                {loading && inMonth ? (
                  <Skeleton className="h-3 w-full" />
                ) : (
                  dayEvents.slice(0, 2).map((event) => (
                    <span
                      key={event.id}
                      className="line-clamp-1 w-full rounded-sm bg-primary/10 px-1 text-[10px] text-primary"
                      data-testid={`appointments-event-${event.id}`}
                    >
                      {new Date(event.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {event.property?.name ?? `#${event.id}`}
                    </span>
                  ))
                )}
                {dayEvents.length > 2 ? (
                  <span className="text-[10px] text-muted-foreground">
                    +{dayEvents.length - 2}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function buildMonthGrid(monthDate: Date): Date[][] {
  const start = startOfMonth(monthDate)
  const end = endOfMonth(monthDate)
  const firstWeekday = (start.getDay() + 6) % 7 // Monday=0
  const days: Date[] = []
  for (let i = firstWeekday; i > 0; i--) {
    const d = new Date(start)
    d.setDate(start.getDate() - i)
    days.push(d)
  }
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1]
    const next = new Date(last)
    next.setDate(last.getDate() + 1)
    days.push(next)
  }
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

function groupEventsByDay(
  events: AppointmentCalendarEvent[]
): Map<string, AppointmentCalendarEvent[]> {
  const map = new Map<string, AppointmentCalendarEvent[]>()
  for (const event of events) {
    const key = event.scheduled_at.slice(0, 10)
    const list = map.get(key) ?? []
    list.push(event)
    map.set(key, list)
  }
  return map
}
