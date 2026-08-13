"use client"

import { Button } from "components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"
import { Input } from "components/ui/input"
import { Search } from "lucide-react"
import { useAdsTranslations } from "../locales/useAdsTranslations"
import type { AdGroupFilters, AdGroupStatus } from "../types"

interface AdGroupsFiltersBarProps {
  filters: AdGroupFilters
  onChange: (next: AdGroupFilters) => void
  loading?: boolean
}

const STATUS_VALUES: (AdGroupStatus | "archived" | "")[] = [
  "",
  "active",
  "inactive",
  "archived",
]

export function AdGroupsFiltersBar({ filters, onChange, loading }: AdGroupsFiltersBarProps) {
  const { t } = useAdsTranslations()

  const labelFor = (value: string): string => {
    if (value === "") return t("ads.groups.statusAll")
    if (value === "active") return t("ads.groups.statusActive")
    if (value === "inactive") return t("ads.groups.statusInactive")
    if (value === "archived") return t("ads.groups.statusArchived")
    return value
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder={t("ads.groups.searchPlaceholder")}
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          disabled={loading}
        />
      </div>

      <Select
        value={(filters.status as string) ?? ""}
        onValueChange={(next) =>
          onChange({
            ...filters,
            status: (next || undefined) as AdGroupFilters["status"],
          })
        }
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("ads.groups.statusAll")} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_VALUES.map((value) => (
            <SelectItem key={value || "all"} value={value}>
              {labelFor(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => onChange({})}
        disabled={loading}
      >
        {t("common.reset")}
      </Button>
    </div>
  )
}
