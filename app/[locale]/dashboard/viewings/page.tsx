"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CalendarDays, List } from "lucide-react"

import { DashboardLayout } from "components/layout/DashboardLayout"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { viewingService } from "src/modules/viewings/services/viewingService"
import { ViewingList } from "src/modules/viewings/components/ViewingList"
import { ViewingCalendar } from "src/modules/viewings/components/ViewingCalendar"
import { ViewingDetailDialog } from "src/modules/viewings/components/ViewingDetailDialog"
import { useViewingRealtime } from "src/modules/viewings/hooks/useViewingRealtime"
import { ApiClientError } from "@/lib/apiClient"
import { ViewingStatus } from "@/types/enums"
import type { CalendarViewingEvent, PropertyViewingDto } from "@/types/dto"

type ViewMode = "list" | "calendar"

function toIsoDate(value: string): string {
  return value ? new Date(value).toISOString() : ""
}

export default function MyViewingsPage() {
  const tNav = useTranslations("nav")
  const [viewings, setViewings] = useState<PropertyViewingDto[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarViewingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>("list")
  const [status, setStatus] = useState<ViewingStatus | undefined>(undefined)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [monthDate, setMonthDate] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarViewingEvent | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await viewingService.listMine({ status })
      setViewings(response.data)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load viewings"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [status])

  const fetchCalendar = useCallback(async () => {
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    try {
      const events = await viewingService.getCalendar(
        toIsoDate(monthStart.toISOString()),
        toIsoDate(monthEnd.toISOString())
      )
      setCalendarEvents(events)
    } catch {
      setCalendarEvents([])
    }
  }, [monthDate])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetchList()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [fetchList])

  useEffect(() => {
    if (view !== "calendar") return
    const handle = window.setTimeout(() => {
      void fetchCalendar()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [view, fetchCalendar])

  useViewingRealtime({
    onViewingUpdated: (viewing) => {
      setViewings((current) => {
        const index = current.findIndex((v) => v.id === viewing.id)
        if (index === -1) return [viewing, ...current]
        const next = [...current]
        next[index] = viewing
        return next
      })
      if (view === "calendar") void fetchCalendar()
    },
  })

  const onSelectEvent = (event: CalendarViewingEvent) => {
    setSelectedEvent(event)
    setDetailOpen(true)
  }

  const headerActions = useMemo(
    () => (
      <div className="flex items-center gap-1 rounded-md border p-0.5">
        <Button
          size="sm"
          variant={view === "list" ? "secondary" : "ghost"}
          onClick={() => setView("list")}
        >
          <List className="size-4 mr-1" />
          List
        </Button>
        <Button
          size="sm"
          variant={view === "calendar" ? "secondary" : "ghost"}
          onClick={() => setView("calendar")}
        >
          <CalendarDays className="size-4 mr-1" />
          Calendar
        </Button>
      </div>
    ),
    [view]
  )

  return (
    <DashboardLayout title={tNav("viewings")} actions={headerActions}>
      <div className="space-y-6">
        {view === "calendar" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Date range</CardTitle>
              <CardDescription>
                Filter the calendar to a specific window. Leave empty to show the full month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {view === "list" ? (
          <ViewingList
            viewings={viewings}
            loading={loading}
            error={error}
            perspective="buyer"
            onFilterChange={(filters) => setStatus(filters.status)}
            onUpdated={(updated) =>
              setViewings((current) =>
                current.map((v) => (v.id === updated.id ? updated : v))
              )
            }
          />
        ) : (
          <div className="space-y-3">
            <ViewingCalendar
              events={calendarEvents}
              monthDate={monthDate}
              onMonthChange={setMonthDate}
              onSelectEvent={onSelectEvent}
            />
          </div>
        )}
      </div>

      <ViewingDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        event={selectedEvent}
        onUpdated={(updated) =>
          setViewings((current) =>
            current.map((v) => (v.id === updated.id ? updated : v))
          )
        }
      />
    </DashboardLayout>
  )
}
