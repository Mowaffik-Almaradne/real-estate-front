"use client"

import { useMemo } from "react"
import { Archive, ArchiveRestore, MoreHorizontal, Search, UserPlus } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"

import type { Lead, LeadFilters, LeadStatus } from "../types"
import { LEAD_SOURCES, LEAD_STATUSES } from "../types"

interface LeadListProps {
  leads: Lead[]
  loading: boolean
  error: string | null
  filters: LeadFilters
  onFiltersChange: (updater: (prev: LeadFilters) => LeadFilters) => void
  onCreate?: () => void
  onSelect?: (lead: Lead) => void
  onArchiveToggle?: (lead: Lead) => void
  showArchived?: boolean
}

const ALL_VALUE = "all"

function statusTone(status: LeadStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "new":
      return "default"
    case "contacted":
      return "secondary"
    case "qualified":
      return "outline"
    case "won":
      return "default"
    case "lost":
      return "destructive"
    default:
      return "outline"
  }
}

function LeadRowSkeleton() {
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

export function LeadList({
  leads,
  loading,
  error,
  filters,
  onFiltersChange,
  onCreate,
  onSelect,
  onArchiveToggle,
  showArchived = false,
}: LeadListProps) {
  const t = useTranslations()

  const statusLabel = useMemo(
    () => ({
      new: t("crm.statuses.new") || "New",
      contacted: t("crm.statuses.contacted") || "Contacted",
      qualified: t("crm.statuses.qualified") || "Qualified",
      won: t("crm.statuses.won") || "Won",
      lost: t("crm.statuses.lost") || "Lost",
    }),
    [t]
  )

  const sourceLabel = useMemo(
    () => ({
      website: t("crm.sources.website") || "Website",
      whatsapp: t("crm.sources.whatsapp") || "WhatsApp",
      referral: t("crm.sources.referral") || "Referral",
      walk_in: t("crm.sources.walk_in") || "Walk-in",
      phone: t("crm.sources.phone") || "Phone",
      other: t("crm.sources.other") || "Other",
    }),
    [t]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="crm-search" className="text-xs text-muted-foreground">
            {t("crm.filters.search") || "Search"}
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="crm-search"
              className="pl-8 w-64"
              placeholder={t("crm.filters.searchPlaceholder") || "Name, phone, email..."}
              value={filters.search ?? ""}
              onChange={(e) =>
                onFiltersChange((prev) => ({
                  ...prev,
                  search: e.target.value || undefined,
                  page: 1,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("crm.filters.status") || "Status"}
          </Label>
          <Select
            value={filters.status ?? ALL_VALUE}
            onValueChange={(value) =>
              onFiltersChange((prev) => ({
                ...prev,
                status: value === ALL_VALUE ? undefined : (value as LeadStatus),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>
                {t("crm.filters.allStatuses") || "All statuses"}
              </SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabel[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("crm.filters.source") || "Source"}
          </Label>
          <Select
            value={filters.source ?? ALL_VALUE}
            onValueChange={(value) =>
              onFiltersChange((prev) => ({
                ...prev,
                source:
                  value === ALL_VALUE ? undefined : (value as (typeof LEAD_SOURCES)[number]),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>
                {t("crm.filters.allSources") || "All sources"}
              </SelectItem>
              {LEAD_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {sourceLabel[source]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {onCreate && (
          <div className="ml-auto">
            <Button onClick={onCreate} data-testid="crm-create-lead">
              <UserPlus className="size-4" />
              {t("crm.actions.newLead") || "New lead"}
            </Button>
          </div>
        )}
      </div>

      {loading && leads.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <LeadRowSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {showArchived
              ? t("crm.empty.archived") || "No archived leads."
              : t("crm.empty.active") || "No leads yet. Create your first lead to get started."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2" data-testid="crm-lead-list">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className="cursor-pointer transition-colors hover:bg-muted/40"
              onClick={() => onSelect?.(lead)}
              data-testid={`crm-lead-row-${lead.id}`}
            >
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">{lead.name}</p>
                    <Badge variant={statusTone(lead.status)}>{statusLabel[lead.status]}</Badge>
                    {lead.archived_at ? (
                      <Badge variant="outline">
                        {t("crm.badges.archived") || "Archived"}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.phone}
                    {lead.email ? ` · ${lead.email}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("crm.fields.source") || "Source"}: {sourceLabel[lead.source]}
                  </p>
                </div>
                {onArchiveToggle && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onArchiveToggle(lead)
                    }}
                    aria-label={
                      lead.archived_at
                        ? t("crm.actions.restore") || "Restore"
                        : t("crm.actions.archive") || "Archive"
                    }
                    data-testid={`crm-archive-${lead.id}`}
                  >
                    {lead.archived_at ? (
                      <ArchiveRestore className="size-4" />
                    ) : (
                      <Archive className="size-4" />
                    )}
                  </Button>
                )}
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
