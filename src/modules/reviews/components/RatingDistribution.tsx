"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

export interface RatingDistributionProps {
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>
  total?: number
  className?: string
}

export function RatingDistribution({
  breakdown,
  total: totalProp,
  className,
}: RatingDistributionProps) {
  const t = useTranslations("reviews")
  const computed = useMemo(() => {
    const total =
      totalProp ??
      Object.values(breakdown).reduce((sum, value) => sum + (value ?? 0), 0)
    return { total }
  }, [breakdown, totalProp])

  if (computed.total === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>{t("noReviews")}</p>
    )
  }

  return (
    <div className={cn("space-y-1", className)}>
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = breakdown[star] ?? 0
        const percent = computed.total > 0 ? (count / computed.total) * 100 : 0
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-muted-foreground">{star}</span>
            <span className="text-amber-500">★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-8 text-end text-muted-foreground">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
