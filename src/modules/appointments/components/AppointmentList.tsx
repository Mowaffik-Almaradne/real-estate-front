"use client"

import { useMemo } from "react"
import { CalendarDays, Filter, MapPin, Video, Home as HomeIcon, Phone, MessageSquare, Mail, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"

import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  type Appointment,
  type AppointmentFilters,
  type AppointmentStatus,
  type AppointmentType,
  type ContactMethod,
  type ViewingType,
} from "../types"
import { AppointmentActions, getAppointmentStatusTone } from "./AppointmentActions"

interface AppointmentListProps {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  filters: AppointmentFilters
  onFiltersChange: (updater: (prev: AppointmentFilters) => AppointmentFilters) => void
  onSelect?: (appointment: Appointment) => void
  onUpdated?: (appointment: Appointment) => void
  onRemoved?: (id: number) => void
}

const ALL_VALUE = "all"

const TYPE_ICON: Record<AppointmentType, typeof MapPin> = {
  viewing: MapPin,
  follow_up: Phone,
  general: CalendarDays,
}

const VIEWING_ICON: Record<ViewingType, typeof MapPin> = {
  in_person: MapPin,
  virtual: Video,
  open_house: HomeIcon,
}

const CONTACT_ICON: Record<ContactMethod, typeof Phone> = {
  call: Phone,
  whatsapp: MessageSquare,
  visit: MapPin,
  email: Mail,
}

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function AppointmentRowSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </CardContent>
    </Card>
  )
}

export function AppointmentList({
  appointments,
  loading,
  error,
  filters,
  onFiltersChange,
  onSelect,
  onUpdated,
  onRemoved,
}: AppointmentListProps) {
  const t = useTranslations()

  const typeLabels = useMemo(
    () => ({
      viewing: t("appointments.types.viewing") || "Viewing",
      follow_up: t("appointments.types.followUp") || "Follow-up",
      general: t("appointments.types.general") || "General",
    }),
    [t]
  )

  const statusLabels = useMemo(
    () => ({
      pending: t("appointments.statuses.pending") || "Pending",
      confirmed: t("appointments.statuses.confirmed") || "Confirmed",
      rescheduled: t("appointments.statuses.rescheduled") || "Rescheduled",
      cancelled: t("appointments.statuses.cancelled") || "Cancelled",
      completed: t("appointments.statuses.completed") || "Completed",
      no_show: t("appointments.statuses.noShow") || "No-show",
    }),
    [t]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">
            {t("appointments.filters.status") || "Status"}
          </label>
          <Select
            value={filters.status ?? ALL_VALUE}
            onValueChange={(value) =>
              onFiltersChange((prev) => ({
                ...prev,
                status: value === ALL_VALUE ? undefined : (value as AppointmentStatus),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>
                {t("appointments.filters.allStatuses") || "All statuses"}
              </SelectItem>
              {APPOINTMENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">
            {t("appointments.filters.type") || "Type"}
          </label>
          <Select
            value={filters.type ?? ALL_VALUE}
            onValueChange={(value) =>
              onFiltersChange((prev) => ({
                ...prev,
                type: value === ALL_VALUE ? undefined : (value as AppointmentType),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>
                {t("appointments.filters.allTypes") || "All types"}
              </SelectItem>
              {APPOINTMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {typeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="size-3" />
          {appointments.length} {t("appointments.results") || "results"}
        </div>
      </div>

      {loading && appointments.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <AppointmentRowSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {t("appointments.empty") || "No appointments match the current filters."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2" data-testid="appointments-list">
          {appointments.map((appointment) => {
            const TypeIcon = TYPE_ICON[appointment.type] ?? CalendarDays
            const ViewingIcon = appointment.viewing_type
              ? VIEWING_ICON[appointment.viewing_type]
              : null
            const ContactIcon = appointment.contact_method
              ? CONTACT_ICON[appointment.contact_method]
              : null
            return (
              <Card
                key={appointment.id}
                className="transition-colors hover:bg-muted/40"
                data-testid={`appointments-row-${appointment.id}`}
              >
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <TypeIcon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {appointment.property?.name ||
                          (appointment.type === "follow_up"
                            ? t("appointments.followUpTitle") || "Follow-up"
                            : t("appointments.generalTitle") || "Appointment")}
                      </p>
                      <Badge variant={getAppointmentStatusTone(appointment.status)}>
                        {statusLabels[appointment.status]}
                      </Badge>
                      <Badge variant="outline">{typeLabels[appointment.type]}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDateTime(appointment.scheduled_at)}
                      </span>
                      <span>
                        {appointment.duration_minutes} {t("appointments.minutes") || "min"}
                      </span>
                      {ViewingIcon && (
                        <span className="inline-flex items-center gap-1">
                          <ViewingIcon className="size-3" />
                          {appointment.viewing_type}
                        </span>
                      )}
                      {ContactIcon && appointment.contact_method && (
                        <span className="inline-flex items-center gap-1">
                          <ContactIcon className="size-3" />
                          {appointment.contact_method}
                        </span>
                      )}
                      {appointment.user?.name && (
                        <span>
                          {t("appointments.with") || "With"} {appointment.user.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelect?.(appointment)}
                      data-testid={`appointments-view-${appointment.id}`}
                    >
                      {t("common.view") || "View"}
                    </Button>
                    <AppointmentActions
                      appointment={appointment}
                      onUpdated={onUpdated}
                      onRemoved={onRemoved}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
