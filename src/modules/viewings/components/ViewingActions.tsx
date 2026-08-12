"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, X, RotateCcw, CheckCheck, UserX, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { viewingService, isSlotConflict, getStatusAfterAction } from "../services/viewingService"
import {
  cancelViewingSchema,
  rescheduleViewingSchema,
  type CancelViewingValues,
  type RescheduleViewingValues,
} from "../schemas"
import { ApiClientError } from "@/lib/apiClient"
import { canTransitionViewingStatus, ViewingStatus } from "@/types/enums"
import type { PropertyViewingDto } from "@/types/dto"

interface ViewingActionsProps {
  viewing: PropertyViewingDto
  perspective: "buyer" | "publisher"
  onUpdated?: (viewing: PropertyViewingDto) => void
}

type ModalState =
  | { kind: "none" }
  | { kind: "cancel" }
  | { kind: "reschedule" }

const nowLocalDateTimeInput = (): string => {
  const date = new Date(viewingDateLocal())
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function viewingDateLocal(): string {
  return new Date().toISOString()
}

export function ViewingActions({ viewing, perspective, onUpdated }: ViewingActionsProps) {
  const [modal, setModal] = useState<ModalState>({ kind: "none" })
  const [busy, setBusy] = useState<null | "confirm" | "complete" | "no_show">(null)
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState<string | null>(null)

  const cancelForm = useForm<CancelViewingValues>({
    resolver: zodResolver(cancelViewingSchema),
    defaultValues: { cancellation_reason: "" },
  })

  const rescheduleForm = useForm<RescheduleViewingValues>({
    resolver: zodResolver(rescheduleViewingSchema),
    defaultValues: {
      scheduled_at: nowLocalDateTimeInput(),
      notes: viewing.notes ?? "",
    },
  })

  const openModal = (kind: ModalState["kind"]) => {
    setError(null)
    setConflict(null)
    if (kind === "reschedule") {
      rescheduleForm.reset({
        scheduled_at: nowLocalDateTimeInput(),
        notes: viewing.notes ?? "",
      })
    }
    if (kind === "cancel") {
      cancelForm.reset({ cancellation_reason: "" })
    }
    if (kind === "none") return
    setModal({ kind })
  }

  const closeModal = () => {
    if (busy) return
    setModal({ kind: "none" })
    setError(null)
    setConflict(null)
  }

  const runAction = async (
    action: "confirm" | "complete" | "no_show",
    fn: () => Promise<PropertyViewingDto>
  ) => {
    setError(null)
    setConflict(null)
    setBusy(action)
    try {
      const result = await fn()
      onUpdated?.(result)
      toast.success(`Viewing ${action.replace("_", " ")}`)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : `Failed to ${action.replace("_", " ")} viewing`
      setError(message)
    } finally {
      setBusy(null)
    }
  }

  const submitCancel = cancelForm.handleSubmit(async (values) => {
    setError(null)
    try {
      const result = await viewingService.cancel(viewing.id, {
        cancellation_reason: values.cancellation_reason,
      })
      onUpdated?.(result)
      toast.success("Viewing cancelled")
      setModal({ kind: "none" })
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to cancel viewing"
      setError(message)
    }
  })

  const submitReschedule = rescheduleForm.handleSubmit(async (values) => {
    setError(null)
    setConflict(null)
    try {
      const scheduledAt = new Date(values.scheduled_at).toISOString()
      const result = await viewingService.reschedule(viewing.id, {
        scheduled_at: scheduledAt,
        duration_minutes: values.duration_minutes,
        buffer_minutes: values.buffer_minutes,
        notes: values.notes || undefined,
      })
      onUpdated?.(result)
      toast.success("Viewing rescheduled")
      setModal({ kind: "none" })
    } catch (err) {
      if (isSlotConflict(err)) {
        setConflict(
          err instanceof ApiClientError
            ? err.message
            : "This slot is no longer available. Please pick another time."
        )
      } else {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to reschedule viewing"
        setError(message)
      }
    }
  })

  const showConfirm =
    perspective === "publisher" &&
    canTransitionViewingStatus(viewing.status, ViewingStatus.confirmed)
  const showReschedule =
    canTransitionViewingStatus(viewing.status, ViewingStatus.rescheduled) ||
    viewing.status === ViewingStatus.confirmed
  const showCancel =
    canTransitionViewingStatus(viewing.status, ViewingStatus.cancelled) &&
    perspective === "buyer" ? canTransitionViewingStatus(viewing.status, ViewingStatus.cancelled) : true
  const showComplete =
    perspective === "publisher" &&
    canTransitionViewingStatus(viewing.status, ViewingStatus.completed)
  const showNoShow =
    perspective === "publisher" &&
    canTransitionViewingStatus(viewing.status, ViewingStatus.no_show)

  if (
    !showConfirm &&
    !showReschedule &&
    !showCancel &&
    !showComplete &&
    !showNoShow
  ) {
    return null
  }

  const targetStatus = (action: Parameters<typeof getStatusAfterAction>[1]) =>
    getStatusAfterAction(viewing.status, action)

  return (
    <>
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {showConfirm && targetStatus("confirm") && (
          <Button
            size="sm"
            onClick={() =>
              runAction("confirm", () => viewingService.confirm(viewing.id))
            }
            disabled={busy !== null}
          >
            {busy === "confirm" ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <Check className="size-4 mr-1" />
            )}
            Confirm
          </Button>
        )}
        {showReschedule && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal("reschedule")}
            disabled={busy !== null}
          >
            <RotateCcw className="size-4 mr-1" />
            Reschedule
          </Button>
        )}
        {showCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal("cancel")}
            disabled={busy !== null}
          >
            <X className="size-4 mr-1" />
            Cancel
          </Button>
        )}
        {showComplete && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              runAction("complete", () => viewingService.complete(viewing.id))
            }
            disabled={busy !== null}
          >
            {busy === "complete" ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <CheckCheck className="size-4 mr-1" />
            )}
            Mark Completed
          </Button>
        )}
        {showNoShow && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              runAction("no_show", () => viewingService.markNoShow(viewing.id))
            }
            disabled={busy !== null}
          >
            {busy === "no_show" ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <UserX className="size-4 mr-1" />
            )}
            No Show
          </Button>
        )}
      </div>

      <Dialog open={modal.kind === "cancel"} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel viewing</DialogTitle>
            <DialogDescription>
              The other party will be notified. Please provide a brief reason.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCancel} className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cancellation_reason">Reason</Label>
              <Textarea
                id="cancellation_reason"
                rows={3}
                placeholder="Schedule conflict, found another property, etc."
                {...cancelForm.register("cancellation_reason")}
              />
              {cancelForm.formState.errors.cancellation_reason && (
                <p className="text-xs text-destructive">
                  {cancelForm.formState.errors.cancellation_reason.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={cancelForm.formState.isSubmitting}
              >
                Keep viewing
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={cancelForm.formState.isSubmitting}
              >
                {cancelForm.formState.isSubmitting && (
                  <Loader2 className="size-4 mr-1 animate-spin" />
                )}
                Cancel viewing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={modal.kind === "reschedule"} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule viewing</DialogTitle>
            <DialogDescription>
              Pick a new date and time. Both parties will be notified.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitReschedule} className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {conflict && (
              <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Slot unavailable</p>
                  <p className="text-xs mt-1">{conflict}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reschedule_at">New date & time</Label>
              <Input
                id="reschedule_at"
                type="datetime-local"
                {...rescheduleForm.register("scheduled_at")}
              />
              {rescheduleForm.formState.errors.scheduled_at && (
                <p className="text-xs text-destructive">
                  {rescheduleForm.formState.errors.scheduled_at.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule_notes">Notes</Label>
              <Textarea
                id="reschedule_notes"
                rows={2}
                {...rescheduleForm.register("notes")}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={rescheduleForm.formState.isSubmitting}
              >
                Keep current
              </Button>
              <Button type="submit" disabled={rescheduleForm.formState.isSubmitting}>
                {rescheduleForm.formState.isSubmitting && (
                  <Loader2 className="size-4 mr-1 animate-spin" />
                )}
                Reschedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
