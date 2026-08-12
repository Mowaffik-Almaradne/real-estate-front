"use client"

import { Star } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

export interface RatingBadgeProps {
  value: number | null | undefined
  count?: number | null
  className?: string
  size?: "sm" | "md"
}

export function RatingBadge({
  value,
  count,
  className,
  size = "sm",
}: RatingBadgeProps) {
  const t = useTranslations("reviews")
  if (value === null || value === undefined || value === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground",
          className
        )}
      >
        <Star className="size-3" aria-hidden />
        {t("noRating")}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
      aria-label={
        count
          ? t("ratingWithCount", { value: value.toFixed(1), count })
          : t("ratingValue", { value: value.toFixed(1) })
      }
    >
      <Star className={cn(size === "sm" ? "size-3" : "size-4", "fill-current")} aria-hidden />
      {value.toFixed(1)}
      {count !== undefined && count !== null && (
        <span className="text-amber-700/70 dark:text-amber-300/70">({count})</span>
      )}
    </span>
  )
}
