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
import { AdStatus } from "@/types/enums"
import { useAdsTranslations } from "../locales/useAdsTranslations"
import type { AdGroupDto, AdFilters } from "../types"

interface AdsFiltersBarProps {
  filters: AdFilters
  onChange: (next: AdFilters) => void
  groups: AdGroupDto[]
  loading?: boolean
}

const STATUS_VALUES: (AdStatus | "")[] = [
  "",
  AdStatus.draft,
  AdStatus.active,
  AdStatus.paused,
  AdStatus.archived,
]

export function AdsFiltersBar({ filters, onChange, groups, loading }: AdsFiltersBarProps) {
  const { t } = useAdsTranslations()

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder={t("ads.searchPlaceholder")}
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          disabled={loading}
        />
      </div>

      <Select
        value={filters.status ?? ""}
        onValueChange={(next) => onChange({ ...filters, status: (next || undefined) as AdStatus | undefined })}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("ads.statusAll")} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_VALUES.map((value) => (
            <SelectItem key={value || "all"} value={value}>
              {value === ""
                ? t("ads.statusAll")
                : t(`ads.status.${value}` as const)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.ad_group_id != null ? String(filters.ad_group_id) : ""}
        onValueChange={(next) =>
          onChange({
            ...filters,
            ad_group_id: next ? Number(next) : undefined,
          })
        }
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("ads.groupAll")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t("ads.groupAll")}</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={String(group.id)}>
              {group.name}
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
