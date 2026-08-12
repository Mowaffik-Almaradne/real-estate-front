"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Card, CardContent } from "components/ui/card"
import { cn } from "lib/utils"

export interface AdvancedFilterValues {
  area_min: string
  area_max: string
  year_built_min: string
  year_built_max: string
  keywords: string
}

export const EMPTY_ADVANCED_FILTERS: AdvancedFilterValues = {
  area_min: "",
  area_max: "",
  year_built_min: "",
  year_built_max: "",
  keywords: "",
}

export const CURRENT_YEAR = new Date().getFullYear()

interface AdvancedFiltersProps {
  values: AdvancedFilterValues
  onChange: (next: AdvancedFilterValues) => void
  onReset: () => void
  className?: string
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="text-xs font-medium text-muted-foreground">{children}</Label>
}

function RangeField({
  label,
  minPlaceholder,
  maxPlaceholder,
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  label: string
  minPlaceholder: string
  maxPlaceholder: string
  min: string
  max: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          inputMode="numeric"
          type="number"
          value={min}
          onChange={(e) => onMinChange(e.target.value)}
          placeholder={minPlaceholder}
        />
        <span className="text-xs text-muted-foreground">—</span>
        <Input
          inputMode="numeric"
          type="number"
          value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          placeholder={maxPlaceholder}
        />
      </div>
    </div>
  )
}

export function AdvancedFilters({
  values,
  onChange,
  onReset,
  className,
}: AdvancedFiltersProps) {
  const tr = useTranslations("search.advanced")
  const [open, setOpen] = useState(false)

  const set =
    (key: keyof AdvancedFilterValues) =>
    (value: string) =>
      onChange({ ...values, [key]: value })

  const count = [
    values.area_min,
    values.area_max,
    values.year_built_min,
    values.year_built_max,
    values.keywords,
  ].filter(Boolean).length

  return (
    <Card className={cn("border-dashed", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="advanced-filters-body"
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
          {tr("title")}
          {count > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <CardContent
          id="advanced-filters-body"
          className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <RangeField
            label={tr("area")}
            minPlaceholder={tr("min")}
            maxPlaceholder={tr("max")}
            min={values.area_min}
            max={values.area_max}
            onMinChange={set("area_min")}
            onMaxChange={set("area_max")}
          />
          <RangeField
            label={tr("yearBuilt")}
            minPlaceholder={tr("min")}
            maxPlaceholder={tr("max")}
            min={values.year_built_min}
            max={values.year_built_max}
            onMinChange={set("year_built_min")}
            onMaxChange={set("year_built_max")}
          />
          <div className="space-y-1.5">
            <FieldLabel>{tr("keywords")}</FieldLabel>
            <Input
              value={values.keywords}
              onChange={(e) => set("keywords")(e.target.value)}
              placeholder={tr("keywordsPlaceholder")}
            />
          </div>
          {count > 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <Button variant="ghost" size="sm" onClick={onReset} type="button">
                <X className="mr-2 size-4" aria-hidden="true" />
                {tr("reset")}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}