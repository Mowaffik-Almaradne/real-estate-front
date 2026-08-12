"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Bell, BellOff, ExternalLink, Loader2, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { Switch } from "components/ui/switch"
import { cn } from "@/lib/utils"
import { formatRelative } from "lib/format"

import type { SavedSearch, SavedSearchFilters } from "../types"

export interface SavedSearchCardProps {
  savedSearch: SavedSearch
  onApply: (savedSearch: SavedSearch) => void
  onToggleAlert: (id: number, enabled: boolean) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onChangeFrequency: (id: number, frequency: SavedSearch["alert_frequency"]) => Promise<void>
}

export function buildFilterSummary(
  filters: SavedSearchFilters,
  labels: {
    propertyType?: string
    contract?: string
    rooms: string
    bathrooms: string
    noFilters: string
  }
): string {
  const f = filters
  const parts: string[] = []
  if (f.search) parts.push(`"${f.search}"`)
  if (f.property_type && labels.propertyType) parts.push(labels.propertyType)
  if (f.type_of_contract && labels.contract) parts.push(labels.contract)
  if (f.city_id != null) parts.push(`#${f.city_id}`)
  if (f.country_id != null) parts.push(`#${f.country_id}`)
  if (f.rooms) parts.push(`${f.rooms} ${labels.rooms}`)
  if (f.bathrooms) parts.push(`${f.bathrooms} ${labels.bathrooms}`)
  if (f.min_price || f.max_price) {
    parts.push(`${f.min_price || "0"}–${f.max_price || "∞"}`)
  }
  if (f.area_min || f.area_max) {
    parts.push(`${f.area_min || "0"}–${f.area_max || "∞"} m²`)
  }
  if (f.year_built_min || f.year_built_max) {
    parts.push(`${f.year_built_min || "…"}–${f.year_built_max || "…"}`)
  }
  if (f.keywords) parts.push(f.keywords)
  return parts.length ? parts.join(" · ") : labels.noFilters
}

export function SavedSearchCard({
  savedSearch,
  onApply,
  onToggleAlert,
  onDelete,
  onChangeFrequency,
}: SavedSearchCardProps) {
  const t = useTranslations("savedSearches")
  const tProperty = useTranslations("property.filters")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const [pendingToggle, setPendingToggle] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [pendingFrequency, setPendingFrequency] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const summary = buildFilterSummary(savedSearch.filters, {
    propertyType: savedSearch.filters.property_type
      ? tProperty(`type.${savedSearch.filters.property_type}`)
      : undefined,
    contract: savedSearch.filters.type_of_contract
      ? tProperty(`contractOption.${savedSearch.filters.type_of_contract}`)
      : undefined,
    rooms: tProperty("rooms"),
    bathrooms: tProperty("bathrooms"),
    noFilters: t("noFilters"),
  })

  async function handleToggle(next: boolean) {
    setPendingToggle(true)
    try {
      await onToggleAlert(savedSearch.id, next)
      toast.success(next ? t("alertsEnabled") : t("alertsDisabled"))
    } catch {
      toast.error(tCommon("error"))
    } finally {
      setPendingToggle(false)
    }
  }

  async function handleDelete() {
    setPendingDelete(true)
    try {
      await onDelete(savedSearch.id)
      toast.success(t("deleted"))
    } catch {
      toast.error(tCommon("error"))
    } finally {
      setPendingDelete(false)
      setConfirming(false)
    }
  }

  async function handleFrequencyChange(value: string) {
    setPendingFrequency(true)
    try {
      await onChangeFrequency(savedSearch.id, value as SavedSearch["alert_frequency"])
    } catch {
      toast.error(tCommon("error"))
    } finally {
      setPendingFrequency(false)
    }
  }

  return (
    <Card className="group relative overflow-hidden border-border/60">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Search className="size-4 shrink-0 text-primary" aria-hidden />
              <h3 className="truncate text-base font-semibold">{savedSearch.name}</h3>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{summary}</p>
          </div>
          {savedSearch.new_matches_count > 0 && (
            <span
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-2 text-xs font-semibold text-destructive-foreground"
              aria-label={t("newMatches", { count: savedSearch.new_matches_count })}
            >
              {savedSearch.new_matches_count > 99 ? "99+" : savedSearch.new_matches_count}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>{t("created", { when: formatRelative(savedSearch.created_at, locale) })}</span>
          {savedSearch.last_match_at && (
            <span>
              {t("lastMatch", { when: formatRelative(savedSearch.last_match_at, locale) })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            {savedSearch.alert_enabled ? (
              <Bell className="size-4 text-emerald-600" aria-hidden />
            ) : (
              <BellOff className="size-4 text-muted-foreground" aria-hidden />
            )}
            <span className="font-medium">
              {savedSearch.alert_enabled
                ? t(`frequencyOptions.${savedSearch.alert_frequency}`)
                : t("alertsOff")}
            </span>
          </div>
          <Switch
            checked={savedSearch.alert_enabled}
            onCheckedChange={handleToggle}
            disabled={pendingToggle || pendingDelete}
            aria-label={t("toggleAlerts")}
            data-testid={`saved-search-toggle-${savedSearch.id}`}
          />
        </div>

        {savedSearch.alert_enabled && savedSearch.alert_frequency !== "instant" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("changeFrequency")}:</span>
            <div className="flex flex-wrap gap-1.5">
              {(["instant", "daily", "weekly"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  disabled={pendingFrequency}
                  onClick={() => handleFrequencyChange(f)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                    savedSearch.alert_frequency === f
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t(`frequencyOptions.${f}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            type="button"
            onClick={() => onApply(savedSearch)}
            size="sm"
            className="flex-1 sm:flex-none"
            data-testid={`saved-search-apply-${savedSearch.id}`}
          >
            <ExternalLink className="size-3.5" aria-hidden />
            {t("apply")}
          </Button>
          {!confirming ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirming(true)}
              disabled={pendingDelete}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              data-testid={`saved-search-delete-${savedSearch.id}`}
            >
              <Trash2 className="size-3.5" aria-hidden />
              {t("delete")}
            </Button>
          ) : (
            <div
              className="flex flex-1 flex-wrap items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-1.5 sm:flex-none"
              role="alertdialog"
              aria-label={t("confirmDelete")}
            >
              <span className="text-xs font-medium text-destructive">{t("confirmDeleteShort")}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={pendingDelete}
                data-testid={`saved-search-cancel-${savedSearch.id}`}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDelete}
                disabled={pendingDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid={`saved-search-confirm-${savedSearch.id}`}
              >
                {pendingDelete ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-3.5" aria-hidden />
                )}
                {t("delete")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}