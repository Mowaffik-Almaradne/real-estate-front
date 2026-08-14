"use client"

import { useState } from "react"
import {
  Check,
  Loader2,
  MoreHorizontal,
  Trash2,
  X,
  CalendarClock,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApiClientError } from "@/lib/apiClient"
import { useTranslations } from "next-intl"

import { appointmentService } from "../services/appointmentsService"
import type { Appointment, AppointmentStatus } from "../types"

const STATUS_TONE: Record<
  AppointmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  confirmed: "default",
  rescheduled: "secondary",
  cancelled: "destructive",
  completed: "secondary",
  no_show: "destructive",
}

interface AppointmentActionsProps {
  appointment: Appointment
  onUpdated?: (appointment: Appointment) => void
  onRemoved?: (id: number) => void
}

export function AppointmentActions({
  appointment,
  onUpdated,
  onRemoved,
}: AppointmentActionsProps) {
  const t = useTranslations()
  const [busy, setBusy] = useState<null | "confirm" | "complete" | "no_show" | "cancel" | "reschedule" | "remove">(null)

  const run = async (
    label:
      | "confirm"
      | "complete"
      | "no_show"
      | "cancel"
      | "reschedule"
      | "remove",
    request: () => Promise<Appointment | void>
  ) => {
    setBusy(label)
    try {
      const result = await request()
      if (label === "remove") {
        toast.success(t("appointments.toast.removed") || "Appointment removed")
        onRemoved?.(appointment.id)
        return
      }
      if (result) {
        onUpdated?.(result)
        toast.success(
          t(`appointments.toast.${label}`) ||
            {
              confirm: "Appointment confirmed",
              complete: "Appointment completed",
              no_show: "Marked as no-show",
              cancel: "Appointment cancelled",
              reschedule: "Appointment rescheduled",
            }[label]
        )
      }
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Action failed"
      toast.error(message)
    } finally {
      setBusy(null)
    }
  }

  const canConfirm = appointment.status === "pending" || appointment.status === "rescheduled"
  const canComplete = appointment.status === "confirmed" || appointment.status === "rescheduled"
  const canNoShow = appointment.status === "confirmed" || appointment.status === "rescheduled"
  const canCancel = appointment.status !== "cancelled" && appointment.status !== "completed" && appointment.status !== "no_show"
  const canReschedule = appointment.status === "pending" || appointment.status === "confirmed"
  const canRemove = appointment.status !== "completed"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={busy != null}
          data-testid={`appointments-actions-${appointment.id}`}
          aria-label={t("common.actions") || "Actions"}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canConfirm && (
          <DropdownMenuItem
            onSelect={() => void run("confirm", () => appointmentService.confirm(appointment.id))}
            disabled={busy === "confirm"}
          >
            <Check className="size-4" />
            {t("appointments.actions.confirm") || "Confirm"}
          </DropdownMenuItem>
        )}
        {canReschedule && (
          <DropdownMenuItem
            onSelect={() => {
              const event = new CustomEvent("appointments:reschedule", { detail: appointment.id })
              window.dispatchEvent(event)
            }}
            disabled={busy === "reschedule"}
          >
            <CalendarClock className="size-4" />
            {t("appointments.actions.reschedule") || "Reschedule"}
          </DropdownMenuItem>
        )}
        {canComplete && (
          <DropdownMenuItem
            onSelect={() => void run("complete", () => appointmentService.complete(appointment.id))}
            disabled={busy === "complete"}
          >
            <Check className="size-4" />
            {t("appointments.actions.complete") || "Mark completed"}
          </DropdownMenuItem>
        )}
        {canNoShow && (
          <DropdownMenuItem
            onSelect={() => void run("no_show", () => appointmentService.markNoShow(appointment.id))}
            disabled={busy === "no_show"}
          >
            <X className="size-4" />
            {t("appointments.actions.noShow") || "Mark no-show"}
          </DropdownMenuItem>
        )}
        {canCancel && (
          <DropdownMenuItem
            onSelect={() => {
              const event = new CustomEvent("appointments:cancel", { detail: appointment.id })
              window.dispatchEvent(event)
            }}
            disabled={busy === "cancel"}
          >
            <X className="size-4" />
            {t("appointments.actions.cancel") || "Cancel"}
          </DropdownMenuItem>
        )}
        {(canConfirm || canReschedule || canComplete || canNoShow || canCancel) && canRemove && (
          <DropdownMenuSeparator />
        )}
        {canRemove && (
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => void run("remove", () => appointmentService.remove(appointment.id))}
            disabled={busy === "remove"}
          >
            <Trash2 className="size-4" />
            {t("common.delete") || "Delete"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function getAppointmentStatusTone(status: AppointmentStatus) {
  return STATUS_TONE[status]
}
