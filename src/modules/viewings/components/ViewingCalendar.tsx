"use client"

import { useMemo } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"

import type { CalendarViewingEvent } from "@/types/dto"

interface ViewingCalendarProps {
  events: CalendarViewingEvent[]
  loading?: boolean
  monthDate: Date
  onMonthChange: (date: Date) => void
  onSelectEvent?: (event: CalendarViewingEvent) => void
}

const WEEK_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function ViewingCalendar({
  events,
  loading,
  monthDate,
  onMonthChange,
  onSelectEvent,
}: ViewingCalendarProps) {
  const monthStart = useMemo(() => startOfMonth(monthDate), [monthDate])
  const monthEnd = useMemo(() => endOfMonth(monthDate), [monthDate])

  const cells = useMemo(() => {
    const start = new Date(monthStart)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(monthEnd)
    end.setDate(end.getDate() + (6 - end.getDay()))
    const days: Date[] = []
    const cursor = new Date(start)
    while (cursor <= end) {
      days.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    return days
  }, [monthStart, monthEnd])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarViewingEvent[]>()
    for (const event of events) {
      const day = event.scheduled_at.slice(0, 10)
      const list = map.get(day) ?? []
      list.push(event)
      map.set(day, list)
    }
    return map
  }, [events])

  const today = new Date()
  const monthLabel = monthDate.toLocaleString("en-US", { month: "long", year: "numeric" })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {monthLabel}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {events.length} viewing{events.length === 1 ? "" : "s"} this month
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onMonthChange(addMonths(monthDate, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onMonthChange(addMonths(monthDate, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Loader2 className="size-4 mr-2 animate-spin" />
            Loading calendar...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px rounded-md border bg-border overflow-hidden">
            {WEEK_DAY_LABELS.map((label) => (
              <div
                key={label}
                className="bg-muted px-2 py-2 text-center text-xs font-medium uppercase text-muted-foreground"
              >
                {label}
              </div>
            ))}
            {cells.map((day) => {
              const inMonth = day.getMonth() === monthDate.getMonth()
              const isToday = isSameDay(day, today)
              const dayKey = day.toISOString().slice(0, 10)
              const dayEvents = eventsByDay.get(dayKey) ?? []
              return (
                <div
                  key={dayKey}
                  className={cn(
                    "min-h-28 bg-background p-2 text-sm",
                    !inMonth && "bg-muted/40 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full text-xs",
                        isToday && "bg-primary text-primary-foreground"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        type="button"
                        key={event.id}
                        onClick={() => onSelectEvent?.(event)}
                        className="w-full truncate rounded-sm border border-border bg-muted/50 px-1.5 py-1 text-left text-xs hover:bg-accent transition"
                      >
                        <span className="font-medium">
                          {formatDate(event.scheduled_at, "en-US")}
                          {", "}
                          {new Date(event.scheduled_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="block truncate text-muted-foreground">
                          {event.property?.name ?? `Property #${event.property_id}`}
                        </span>
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ViewingCalendarLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Clock className="size-3" /> Click a viewing to see details
      </span>
    </div>
  )
}
