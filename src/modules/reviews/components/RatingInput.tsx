"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

export interface RatingInputProps {
  value: number
  onChange: (next: number) => void
  max?: number
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

const SIZE_CLASS: Record<NonNullable<RatingInputProps["size"]>, string> = {
  sm: "size-5",
  md: "size-7",
  lg: "size-9",
}

export function RatingInput({
  value,
  onChange,
  max = 5,
  size = "md",
  disabled = false,
  className,
  ariaLabel,
}: RatingInputProps) {
  const t = useTranslations("reviews")
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value

  function selectStar(index: number) {
    if (disabled) return
    onChange(index + 1)
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="radiogroup"
      aria-label={ariaLabel ?? t("ratingLabel")}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i + 1}
          aria-label={`${i + 1} ${t("stars", { count: i + 1 })}`}
          disabled={disabled}
          onMouseEnter={() => setHover(i + 1)}
          onFocus={() => setHover(i + 1)}
          onClick={() => selectStar(i)}
          className={cn(
            "inline-flex items-center justify-center rounded-md p-0.5 transition-transform",
            !disabled && "hover:scale-110",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          <Star
            className={cn(
              SIZE_CLASS[size],
              "transition-colors",
              i < display
                ? "fill-amber-500 text-amber-500"
                : "text-muted-foreground/40"
            )}
            aria-hidden
          />
        </button>
      ))}
    </div>
  )
}
