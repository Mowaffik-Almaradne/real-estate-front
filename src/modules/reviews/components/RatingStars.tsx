"use client"

import { Star, StarHalf } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RatingStarsProps {
  value: number
  max?: number
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
  showValue?: boolean
  ariaLabel?: string
}

const SIZE_CLASS: Record<NonNullable<RatingStarsProps["size"]>, string> = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
}

export function RatingStars({
  value,
  max = 5,
  size = "sm",
  className,
  showValue = false,
  ariaLabel,
}: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(max, value))
  const full = Math.floor(clamped)
  const hasHalf = clamped - full >= 0.25 && clamped - full < 0.75
  const fullCount = hasHalf ? full : Math.round(clamped)

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="img"
      aria-label={ariaLabel ?? `${clamped.toFixed(1)} out of ${max} stars`}
    >
      <div className="inline-flex">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < fullCount
          const half = !filled && hasHalf && i === fullCount
          return (
            <span
              key={i}
              className={cn(
                "inline-flex",
                filled ? "text-amber-500" : "text-muted-foreground/40"
              )}
            >
              {half ? (
                <StarHalf
                  className={cn(SIZE_CLASS[size], "fill-amber-500")}
                  aria-hidden
                />
              ) : (
                <Star
                  className={cn(SIZE_CLASS[size], filled && "fill-amber-500")}
                  aria-hidden
                />
              )}
            </span>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground">{clamped.toFixed(1)}</span>
      )}
    </div>
  )
}
