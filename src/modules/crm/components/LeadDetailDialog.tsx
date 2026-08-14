"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MessageSquare, Trash2, Save, Check, X, Plus } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ApiClientError, toFormErrors } from "@/lib/apiClient"
import { useTranslations } from "next-intl"

import { useLeadNotes } from "../hooks/useLeadNotes"
import { leadService } from "../services/crmService"
import {
  createLeadNoteSchema,
  type CreateLeadNoteValues,
  updateLeadNoteSchema,
  type UpdateLeadNoteValues,
  updateLeadStatusSchema,
  type UpdateLeadStatusValues,
} from "../schemas"
import { LEAD_STATUSES } from "../types"
import type { Lead, LeadStatus } from "../types"

interface LeadDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
  onUpdated?: (lead: Lead) => void
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleString()
  } catch {
    return "—"
  }
}

function NewNoteForm({ onSubmit, disabled }: { onSubmit: (body: string) => Promise<unknown>; disabled: boolean }) {
  const t = useTranslations()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadNoteValues>({
    resolver: zodResolver(createLeadNoteSchema),
    defaultValues: { body: "" },
  })

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values.body)
        reset({ body: "" })
      })}
      className="space-y-2"
    >
      <Textarea
        placeholder={t("crm.notes.placeholder") || "Add a note about this lead..."}
        rows={3}
        {...register("body")}
        disabled={disabled || isSubmitting}
      />
      {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={disabled || isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {t("crm.notes.add") || "Add note"}
        </Button>
      </div>
    </form>
  )
}

function NoteRow({
  note,
  onUpdate,
  onDelete,
}: {
  note: { id: number; body: string; created_at: string; author?: { name?: string } | null }
  onUpdate: (id: number, body: string) => Promise<unknown>
  onDelete: (id: number) => Promise<boolean>
}) {
  const t = useTranslations()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateLeadNoteValues>({
    resolver: zodResolver(updateLeadNoteSchema),
    defaultValues: { body: note.body },
  })

  useEffect(() => {
    reset({ body: note.body })
  }, [note.body, reset])

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit(async (values) => {
          setBusy(true)
          try {
            await onUpdate(note.id, values.body)
            setEditing(false)
          } finally {
            setBusy(false)
          }
        })}
        className="space-y-2 rounded-md border bg-muted/30 p-3"
      >
        <Textarea rows={3} {...register("body")} disabled={isSubmitting || busy} />
        {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              reset({ body: note.body })
              setEditing(false)
            }}
            disabled={isSubmitting || busy}
          >
            <X className="size-4" />
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting || busy}>
            {isSubmitting || busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {t("common.save") || "Save"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="rounded-md border bg-card p-3">
      <p className="whitespace-pre-wrap text-sm">{note.body}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {note.author?.name ? `${note.author.name} · ` : ""}
          {formatDateTime(note.created_at)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={() => setEditing(true)}
            aria-label={t("common.edit") || "Edit"}
          >
            <Save className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={async () => {
              setBusy(true)
              try {
                await onDelete(note.id)
              } finally {
                setBusy(false)
              }
            }}
            aria-label={t("common.delete") || "Delete"}
            disabled={busy}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function LeadDetailDialog({ open, onOpenChange, lead, onUpdated }: LeadDetailDialogProps) {
  const t = useTranslations()
  const notes = useLeadNotes(open && lead ? lead.id : null)
  const [statusBusy, setStatusBusy] = useState(false)
  const [lostReason, setLostReason] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "">("")

  useEffect(() => {
    if (lead) {
      Promise.resolve().then(() => {
        setLostReason(lead.lost_reason ?? "")
        setSelectedStatus(lead.status)
      })
    }
  }, [lead])

  const onApplyStatus = async () => {
    if (!lead || !selectedStatus) return
    const values: UpdateLeadStatusValues = {
      status: selectedStatus as LeadStatus,
      lost_reason: selectedStatus === "lost" ? lostReason : "",
    }
    const parsed = updateLeadStatusSchema.safeParse(values)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      toast.error(first?.message ?? (t("crm.toast.invalid") || "Invalid status update"))
      return
    }
    setStatusBusy(true)
    try {
      const updated = await leadService.updateStatus(lead.id, {
        status: parsed.data.status,
        lost_reason:
          parsed.data.status === "lost" ? parsed.data.lost_reason || null : null,
      })
      toast.success(t("crm.toast.statusUpdated") || "Status updated")
      onUpdated?.(updated)
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fieldErrors = toFormErrors<UpdateLeadStatusValues>(err.errors)
        const firstError = Object.values(fieldErrors)[0]
        toast.error(firstError ?? err.message)
      } else {
        const message = err instanceof Error ? err.message : "Update failed"
        toast.error(message)
      }
    } finally {
      setStatusBusy(false)
    }
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{lead.name}</span>
            <Badge variant="secondary">{STATUS_LABELS[lead.status]}</Badge>
          </DialogTitle>
          <DialogDescription>
            {lead.phone}
            {lead.email ? ` · ${lead.email}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>{t("crm.fields.status") || "Status"}</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selectedStatus || lead.status}
                onValueChange={(value) => setSelectedStatus(value as LeadStatus)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStatus === "lost" && (
                <Input
                  className="flex-1"
                  placeholder={t("crm.fields.lostReason") || "Reason for losing"}
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                />
              )}
              <Button
                size="sm"
                onClick={onApplyStatus}
                disabled={statusBusy || selectedStatus === lead.status}
                data-testid="crm-apply-status"
              >
                {statusBusy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {t("common.apply") || "Apply"}
              </Button>
            </div>
            {lead.lost_reason && lead.status === "lost" && (
              <p className="text-xs text-muted-foreground">
                {t("crm.fields.lostReason") || "Reason"}: {lead.lost_reason}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">
                {t("crm.notes.title") || "Notes"} ({notes.notes.length})
              </h3>
            </div>
            <NewNoteForm
              onSubmit={async (body) => {
                await notes.create(body)
              }}
              disabled={notes.loading}
            />
            {notes.loading ? (
              <p className="text-xs text-muted-foreground">
                {t("common.loading") || "Loading..."}
              </p>
            ) : notes.error ? (
              <p className="text-xs text-destructive">{notes.error}</p>
            ) : notes.notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("crm.notes.empty") || "No notes yet."}
              </p>
            ) : (
              <div className="space-y-2">
                {notes.notes.map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    onUpdate={notes.update}
                    onDelete={notes.remove}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.close") || "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
