"use client"

import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table"
import { Skeleton } from "components/ui/skeleton"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import type { SubscriptionFeature, SubscriptionFeatureFilters } from "../types"
import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

interface SubscriptionFeaturesTableProps {
  features: SubscriptionFeature[]
  loading: boolean
  emptyMessage: string
  onEdit: (feature: SubscriptionFeature) => void
  onDelete: (feature: SubscriptionFeature) => void
}

export function SubscriptionFeaturesTable({
  features,
  loading,
  emptyMessage,
  onEdit,
  onDelete,
}: SubscriptionFeaturesTableProps) {
  const { t } = useSubscriptionsTranslations()
  const rows = useMemo(() => features, [features])

  if (loading && rows.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("features.columns.name")}</TableHead>
            <TableHead>{t("features.columns.slug")}</TableHead>
            <TableHead>{t("features.columns.type")}</TableHead>
            <TableHead>{t("features.columns.description")}</TableHead>
            <TableHead className="w-[1%] text-end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((feature) => (
            <TableRow key={feature.id}>
              <TableCell className="font-medium">{feature.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {feature.slug}
              </TableCell>
              <TableCell className="text-sm">
                {feature.type === "toggle"
                  ? t("features.types.toggle")
                  : t("features.types.limit")}
              </TableCell>
              <TableCell className="max-w-[320px] truncate text-sm text-muted-foreground">
                {feature.description ?? "—"}
              </TableCell>
              <TableCell className="text-end">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => onEdit(feature)}
                  >
                    {t("features.editFeature")}
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-destructive hover:underline"
                    onClick={() => onDelete(feature)}
                  >
                    {t("features.delete.confirm")}
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface SubscriptionFeaturesFiltersBarProps {
  filters: SubscriptionFeatureFilters
  onChange: (filters: SubscriptionFeatureFilters) => void
  loading?: boolean
}

export function SubscriptionFeaturesFiltersBar({
  filters,
  onChange,
  loading,
}: SubscriptionFeaturesFiltersBarProps) {
  const { t } = useSubscriptionsTranslations()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="features-search">
          {t("features.searchPlaceholder")}
        </Label>
        <Input
          id="features-search"
          placeholder={t("features.searchPlaceholder")}
          disabled={loading}
          value={filters.search ?? ""}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value || undefined })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="features-type">{t("features.columns.type")}</Label>
        <select
          id="features-type"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={filters.type ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              type:
                event.target.value === ""
                  ? undefined
                  : (event.target.value as SubscriptionFeatureFilters["type"]),
            })
          }
        >
          <option value="">All</option>
          <option value="toggle">{t("features.types.toggle")}</option>
          <option value="limit">{t("features.types.limit")}</option>
        </select>
      </div>
    </div>
  )
}
