"use client"

import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { ANALYTICS_RANGES, type AnalyticsRange } from "../types"

interface AnalyticsRangePickerProps {
  value: AnalyticsRange
  onChange: (range: AnalyticsRange) => void
  disabled?: boolean
  className?: string
}

export function AnalyticsRangePicker({
  value,
  onChange,
  disabled,
  className,
}: AnalyticsRangePickerProps) {
  const t = useTranslations("analytics")

  return (
    <div
      role="radiogroup"
      aria-label={t("range")}
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1",
        className
      )}
      data-testid="analytics-range-picker"
    >
      {ANALYTICS_RANGES.map((range) => {
        const isActive = value === range
        return (
          <button
            key={range}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(range)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              disabled && "opacity-50"
            )}
          >
            {t(`ranges.${range}`)}
          </button>
        )
      })}
    </div>
  )
}