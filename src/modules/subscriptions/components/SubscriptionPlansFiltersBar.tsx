"use client"

import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Switch } from "components/ui/switch"
import type { SubscriptionPlanFilters } from "../types"
import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

interface SubscriptionPlansFiltersBarProps {
  filters: SubscriptionPlanFilters
  onChange: (filters: SubscriptionPlanFilters) => void
  loading?: boolean
}

export function SubscriptionPlansFiltersBar({
  filters,
  onChange,
  loading,
}: SubscriptionPlansFiltersBarProps) {
  const { t } = useSubscriptionsTranslations()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="plans-search">{t("plans.searchPlaceholder")}</Label>
        <Input
          id="plans-search"
          placeholder={t("plans.searchPlaceholder")}
          disabled={loading}
          value={filters.search ?? ""}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value || undefined })
          }
        />
      </div>
      <div className="flex items-end justify-between rounded-md border p-3">
        <div>
          <p className="text-sm font-medium">{t("plans.columns.active")}</p>
        </div>
        <Switch
          checked={Boolean(filters.is_active)}
          onCheckedChange={(checked) =>
            onChange({ ...filters, is_active: checked || undefined })
          }
        />
      </div>
    </div>
  )
}
