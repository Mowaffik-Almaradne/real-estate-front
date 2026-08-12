"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Video, Home as HomeIcon, AlertCircle, Filter } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "@/i18n/navigation"

import { ViewingActions } from "./ViewingActions"
import { statusLabel, statusTone, formatDateTime } from "@/lib/format"
import { useTranslations } from "next-intl"
import { ViewingStatus } from "@/types/enums"
import type { PropertyViewingDto } from "@/types/dto"

interface ViewingListProps {
  viewings: PropertyViewingDto[]
  loading: boolean
  error: string | null
  perspective: "buyer" | "publisher"
  onFilterChange?: (filters: { status?: ViewingStatus }) => void
  onUpdated?: (viewing: PropertyViewingDto) => void
}

const STATUS_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: ViewingStatus.pending, label: "Pending" },
  { value: ViewingStatus.confirmed, label: "Confirmed" },
  { value: ViewingStatus.rescheduled, label: "Rescheduled" },
  { value: ViewingStatus.cancelled, label: "Cancelled" },
  { value: ViewingStatus.completed, label: "Completed" },
  { value: ViewingStatus.no_show, label: "No Show" },
]

const VIEWING_TYPE_ICONS = {
  in_person: MapPin,
  virtual: Video,
  open_house: HomeIcon,
} as const

export function ViewingList({
  viewings,
  loading,
  error,
  perspective,
  onFilterChange,
  onUpdated,
}: ViewingListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    onFilterChange?.({
      status: value === "all" ? undefined : (value as ViewingStatus),
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-destructive">
          <AlertCircle className="size-5 mx-auto mb-2" />
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {viewings.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            <Calendar className="size-8 mx-auto mb-3 text-muted-foreground/60" />
            <p className="font-medium">No viewings yet</p>
            <p className="text-xs mt-1">
              {perspective === "buyer"
                ? "Book a viewing on any property to get started."
                : "Buyers will appear here once they book a viewing."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {viewings.map((viewing) => (
            <ViewingListItem
              key={viewing.id}
              viewing={viewing}
              perspective={perspective}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ViewingListItemProps {
  viewing: PropertyViewingDto
  perspective: "buyer" | "publisher"
  onUpdated?: (viewing: PropertyViewingDto) => void
}

function ViewingListItem({ viewing, perspective, onUpdated }: ViewingListItemProps) {
  const tStatus = useTranslations("status")
  const TypeIcon = VIEWING_TYPE_ICONS[viewing.viewing_type] ?? MapPin
  const participantLabel = perspective === "buyer" ? "Agent" : "Visitor"
  const participant = perspective === "buyer" ? viewing.agent : viewing.user

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            {viewing.property ? (
              <Link
                href={`/properties/${viewing.property.id}`}
                className="font-semibold hover:underline"
              >
                {viewing.property.name}
              </Link>
            ) : (
              <p className="font-semibold">Property #{viewing.property_id}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {formatDateTime(viewing.scheduled_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {viewing.duration_minutes} min
                {viewing.buffer_minutes > 0 ? ` + ${viewing.buffer_minutes} buffer` : ""}
              </span>
              <span className="flex items-center gap-1">
                <TypeIcon className="size-3.5" />
                {viewing.viewing_type.replace("_", " ")}
              </span>
            </div>
            {participant && (
              <p className="text-xs text-muted-foreground">
                {participantLabel}: {participant.name}
              </p>
            )}
            {viewing.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {viewing.notes}
              </p>
            )}
            {viewing.cancellation_reason && (
              <p className="text-xs text-destructive">
                Cancelled: {viewing.cancellation_reason}
              </p>
            )}
          </div>
          <Badge variant={statusTone(viewing.status) === "muted" ? "secondary" : "default"}>
            {statusLabel(viewing.status, tStatus)}
          </Badge>
        </div>
        <ViewingActions viewing={viewing} perspective={perspective} onUpdated={onUpdated} />
      </CardContent>
    </Card>
  )
}
