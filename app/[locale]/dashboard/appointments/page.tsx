"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { CalendarCheck, CalendarDays, List } from "lucide-react"

import { DashboardLayout } from "components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import {
  AppointmentCalendar,
  AppointmentList,
  StatusUpdateDialog,
} from "src/modules/appointments"
import { useAppointments } from "src/modules/appointments/hooks/useAppointments"
import type { Appointment } from "src/modules/appointments"

type ViewMode = "list" | "calendar"

export default function AppointmentsPage() {
  const t = useTranslations()
  const [view, setView] = useState<ViewMode>("list")
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean
    mode: "cancel" | "reschedule"
    appointment: Appointment | null
  }>({ open: false, mode: "cancel", appointment: null })
  const [refreshKey, setRefreshKey] = useState(0)

  const { appointments, loading, error, filters, setFilters, refresh } = useAppointments("all")

  const onSelect = useCallback((appointment: Appointment) => {
    setStatusDialog({ open: false, mode: "cancel", appointment })
  }, [])

  const onUpdated = useCallback(
    (updated: Appointment) => {
      void refresh()
      if (statusDialog.open) {
        setStatusDialog({ open: false, mode: statusDialog.mode, appointment: updated })
      }
      setRefreshKey((key) => key + 1)
    },
    [refresh, statusDialog]
  )

  const onRemoved = useCallback(
    () => {
      void refresh()
      setRefreshKey((key) => key + 1)
    },
    [refresh]
  )

  useEffect(() => {
    const handle = (event: Event) => {
      const custom = event as CustomEvent<number>
      const id = custom.detail
      const appointment = appointments.find((a) => a.id === id) ?? null
      if (!appointment) return
      setStatusDialog({ open: true, mode: "reschedule", appointment })
    }
    const handleCancel = (event: Event) => {
      const custom = event as CustomEvent<number>
      const id = custom.detail
      const appointment = appointments.find((a) => a.id === id) ?? null
      if (!appointment) return
      setStatusDialog({ open: true, mode: "cancel", appointment })
    }
    window.addEventListener("appointments:reschedule", handle as EventListener)
    window.addEventListener("appointments:cancel", handleCancel as EventListener)
    return () => {
      window.removeEventListener("appointments:reschedule", handle as EventListener)
      window.removeEventListener("appointments:cancel", handleCancel as EventListener)
    }
  }, [appointments])

  const headerActions = (
    <div className="flex items-center gap-1 rounded-md border p-0.5">
      <Button
        size="sm"
        variant={view === "list" ? "secondary" : "ghost"}
        onClick={() => setView("list")}
        data-testid="appointments-view-list"
      >
        <List className="size-4" />
        {t("appointments.view.list") || "List"}
      </Button>
      <Button
        size="sm"
        variant={view === "calendar" ? "secondary" : "ghost"}
        onClick={() => setView("calendar")}
        data-testid="appointments-view-calendar"
      >
        <CalendarDays className="size-4" />
        {t("appointments.view.calendar") || "Calendar"}
      </Button>
    </div>
  )

  return (
    <DashboardLayout
      title={t("nav.appointments") || "Appointments"}
      actions={headerActions}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="size-4" />
              {t("appointments.title") || "Appointments"}
            </CardTitle>
            <CardDescription>
              {t("appointments.subtitle") ||
                "View, confirm, reschedule, complete, and cancel appointments. Follow-ups are linked to leads or properties."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === "list" ? (
              <AppointmentList
                appointments={appointments}
                loading={loading}
                error={error}
                filters={filters}
                onFiltersChange={(updater) => {
                  setFilters(updater)
                }}
                onSelect={onSelect}
                onUpdated={onUpdated}
                onRemoved={onRemoved}
              />
            ) : (
              <AppointmentCalendar
                onSelect={(event) => {
                  const match = appointments.find((a) => a.id === event.id)
                  if (match) onSelect(match)
                }}
                refreshKey={refreshKey}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <StatusUpdateDialog
        open={statusDialog.open}
        mode={statusDialog.mode}
        appointment={statusDialog.appointment}
        onOpenChange={(open) =>
          setStatusDialog((current) => ({ ...current, open }))
        }
        onUpdated={onUpdated}
      />
    </DashboardLayout>
  )
}
