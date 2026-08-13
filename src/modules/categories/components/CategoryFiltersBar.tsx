"use client"

import { CATEGORY_TYPES } from "../types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCategoriesTranslations } from "../locales/useCategoriesTranslations"

interface CategoryFiltersBarProps {
  type: "property" | "car" | undefined
  search: string
  onTypeChange: (type: "property" | "car" | undefined) => void
  onSearchChange: (search: string) => void
}

const ALL_TYPES = "__all__"

export function CategoryFiltersBar({
  type,
  search,
  onTypeChange,
  onSearchChange,
}: CategoryFiltersBarProps) {
  const { t } = useCategoriesTranslations()

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">{t("common.search")}</label>
        <input
          className="h-9 rounded-md border border-input bg-background px-3 text-sm w-64"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          data-testid="categories-search"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">{t("typeLabel")}</label>
        <Select
          value={type ?? ALL_TYPES}
          onValueChange={(value) =>
            onTypeChange(
              value === ALL_TYPES ? undefined : (value as "property" | "car")
            )
          }
        >
          <SelectTrigger className="w-44" data-testid="categories-type-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES}>{t("typeAll")}</SelectItem>
            {CATEGORY_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "property" ? t("typeProperty") : t("typeCar")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
