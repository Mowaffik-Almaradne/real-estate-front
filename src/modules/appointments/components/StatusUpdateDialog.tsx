"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApiClientError, toFormErrors } from "@/lib/apiClient"
import { useTranslations } from "next-intl"

import { appointmentService } from "../services/appointmentsService"
import {
  updateAppointmentStatusSchema,
  type UpdateAppointmentStatusValues,
} from "../schemas"
import type { Appointment } from "../types"

interface StatusUpdateDialogProps {
  open: boolean
  mode: "cancel" | "reschedule"
  appointment: Appointment | null
  onOpenChange: (open: boolean) => void
  onUpdated?: (appointment: Appointment) => void
}

function nowLocalDateTimeInput(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 60)
  return now.toISOString().slice(0, 16)
}

export function StatusUpdateDialog({
  open,
  mode,
  appointment,
  onOpenChange,
  onUpdated,
}: StatusUpdateDialogProps) {
  const t = useTranslations()
  const [submitting, setSubmitting] = useState(false)
  const isCancel = mode === "cancel"

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UpdateAppointmentStatusValues>({
    resolver: zodResolver(updateAppointmentStatusSchema),
    defaultValues: {
      status: isCancel ? "cancelled" : "rescheduled",
      cancellation_reason: "",
      agent_notes: "",
      scheduled_at: nowLocalDateTimeInput(),
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        status: isCancel ? "cancelled" : "rescheduled",
        cancellation_reason: "",
        agent_notes: "",
        scheduled_at: nowLocalDateTimeInput(),
      })
    }
  }, [open, isCancel, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!appointment) return
    setSubmitting(true)
    try {
      const payload = {
        status: values.status,
        cancellation_reason: values.cancellation_reason || null,
        agent_notes: values.agent_notes || null,
        scheduled_at: values.scheduled_at || undefined,
      }
      const updated = isCancel
        ? await appointmentService.cancel(appointment.id, payload)
        : await appointmentService.reschedule(appointment.id, payload)
      toast.success(
        isCancel
          ? t("appointments.toast.cancel") || "Appointment cancelled"
          : t("appointments.toast.reschedule") || "Appointment rescheduled"
      )
      onUpdated?.(updated)
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiClientError && err.isValidation()) {
        const fieldErrors = toFormErrors<UpdateAppointmentStatusValues>(err.errors)
        for (const [key, message] of Object.entries(fieldErrors)) {
          if (message) {
            setError(key as keyof UpdateAppointmentStatusValues, { message })
          }
        }
        return
      }
      const message = err instanceof Error ? err.message : "Action failed"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  })

  if (!appointment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCancel
              ? t("appointments.cancelTitle") || "Cancel appointment"
              : t("appointments.rescheduleTitle") || "Reschedule appointment"}
          </DialogTitle>
          <DialogDescription>
            {appointment.property?.name ?? `#${appointment.id}`} ·{" "}
            {new Date(appointment.scheduled_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {!isCancel && (
            <div className="space-y-1.5">
              <Label htmlFor="appt-scheduled_at">
                {t("appointments.fields.scheduledAt") || "New date and time"} *
              </Label>
              <Input
                id="appt-scheduled_at"
                type="datetime-local"
                {...register("scheduled_at")}
              />
              {errors.scheduled_at && (
                <p className="text-xs text-destructive">{errors.scheduled_at.message}</p>
              )}
            </div>
          )}

          {isCancel && (
            <div className="space-y-1.5">
              <Label htmlFor="appt-cancel-reason">
                {t("appointments.fields.cancellationReason") || "Cancellation reason"} *
              </Label>
              <Textarea
                id="appt-cancel-reason"
                rows={3}
                placeholder={
                  t("appointments.fields.cancellationPlaceholder") ||
                  "Tell the other party why this appointment is being cancelled..."
                }
                {...register("cancellation_reason")}
              />
              {errors.cancellation_reason && (
                <p className="text-xs text-destructive">
                  {errors.cancellation_reason.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="appt-agent_notes">
              {t("appointments.fields.agentNotes") || "Internal notes"}
            </Label>
            <Textarea
              id="appt-agent_notes"
              rows={2}
              {...register("agent_notes")}
            />
            {errors.agent_notes && (
              <p className="text-xs text-destructive">{errors.agent_notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isCancel
                ? t("appointments.actions.cancel") || "Cancel appointment"
                : t("appointments.actions.reschedule") || "Reschedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
