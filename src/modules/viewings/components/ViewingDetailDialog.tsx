"use client"

import { useEffect, useState } from "react"
import { Calendar, Loader2, MapPin, Video, Home as HomeIcon, User } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { ViewingActions } from "./ViewingActions"
import { viewingService } from "../services/viewingService"
import { formatDateTime, statusLabel, statusTone } from "@/lib/format"
import { useTranslations } from "next-intl"
import { ApiClientError } from "@/lib/apiClient"
import type { CalendarViewingEvent, PropertyViewingDto } from "@/types/dto"
import { useAuth } from "src/context/AuthContext"

interface ViewingDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarViewingEvent | null
  onUpdated?: (viewing: PropertyViewingDto) => void
}

const VIEWING_TYPE_ICONS = {
  in_person: MapPin,
  virtual: Video,
  open_house: HomeIcon,
} as const

export function ViewingDetailDialog({
  open,
  onOpenChange,
  event,
  onUpdated,
}: ViewingDetailDialogProps) {
  if (!event) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="size-4" />
            Viewing details
          </DialogTitle>
          <DialogDescription>
            {event.property?.name ?? `Property #${event.property_id}`}
          </DialogDescription>
        </DialogHeader>
        <ViewingDetailBody
          key={event.id}
          eventId={event.id}
          onUpdated={onUpdated}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface ViewingDetailBodyProps {
  eventId: number
  onUpdated?: (viewing: PropertyViewingDto) => void
  onClose: () => void
}

function ViewingDetailBody({ eventId, onUpdated, onClose }: ViewingDetailBodyProps) {
  const { user } = useAuth()
  const tStatus = useTranslations("status")
  const [detail, setDetail] = useState<PropertyViewingDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void viewingService
      .getById(eventId)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to load viewing details"
        setError(message)
        toast.error(message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [eventId])

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        <Loader2 className="size-4 mr-2 animate-spin" />
        Loading...
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!detail) return null

  const perspective: "buyer" | "publisher" =
    user ? (detail.user_id === user.id ? "buyer" : "publisher") : "publisher"

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={statusTone(detail.status) === "muted" ? "secondary" : "default"}>
            {statusLabel(detail.status, tStatus)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDateTime(detail.scheduled_at)}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Type</dt>
            <dd className="flex items-center gap-1 capitalize">
              {(() => {
                const Icon = VIEWING_TYPE_ICONS[detail.viewing_type] ?? MapPin
                return (
                  <>
                    <Icon className="size-3.5" />
                    {detail.viewing_type.replace("_", " ")}
                  </>
                )
              })()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Duration</dt>
            <dd>
              {detail.duration_minutes} min
              {detail.buffer_minutes > 0 ? ` + ${detail.buffer_minutes} buffer` : ""}
            </dd>
          </div>
          {detail.max_attendees > 1 && (
            <div>
              <dt className="text-xs text-muted-foreground">Attendees</dt>
              <dd>{detail.max_attendees}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-muted-foreground">Scheduled</dt>
            <dd>{formatDateTime(detail.scheduled_at)}</dd>
          </div>
          {detail.user && (
            <div className="col-span-2">
              <dt className="text-xs text-muted-foreground">Visitor</dt>
              <dd className="flex items-center gap-1">
                <User className="size-3.5" />
                {detail.user.name}
              </dd>
            </div>
          )}
        </dl>

        {detail.notes && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{detail.notes}</p>
          </div>
        )}
        {detail.cancellation_reason && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cancellation reason</p>
            <p className="text-sm text-destructive">{detail.cancellation_reason}</p>
          </div>
        )}

        <div className="pt-2">
          <ViewingActions
            viewing={detail}
            perspective={perspective}
            onUpdated={(updated) => {
              setDetail(updated)
              onUpdated?.(updated)
            }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </>
  )
}
