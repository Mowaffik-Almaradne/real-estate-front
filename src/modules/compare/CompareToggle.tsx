"use client"

import { CheckCircle2, Scale } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { cn } from "lib/utils"
import { useCompare } from "./CompareProvider"
import { MAX_COMPARE_ITEMS } from "./types"

interface CompareToggleProps {
  propertyId: number
  variant?: "icon" | "pill"
  className?: string
}

export function CompareToggle({
  propertyId,
  variant = "icon",
  className,
}: CompareToggleProps) {
  const t = useTranslations("compare")
  const { contains, toggle, canAdd, maxItems, isHydrated } = useCompare()
  const selected = isHydrated && contains(propertyId)
  const disabled = !selected && !canAdd

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nowSelected = toggle(propertyId)
    if (!nowSelected && !selected) {
      toast.error(t("maxReached", { max: maxItems }))
      return
    }
    if (nowSelected) toast.success(t("added"))
    else toast.success(t("removed"))
  }

  const label = selected ? t("removeFromCompare") : t("addToCompare")

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={label}
        title={disabled ? t("maxReached", { max: maxItems }) : label}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          selected
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-background hover:border-primary/40",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {selected ? (
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
        ) : (
          <Scale className="size-3.5" aria-hidden="true" />
        )}
        <span>{label}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={label}
      title={disabled ? t("maxReached", { max: maxItems }) : label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full border bg-background/90 backdrop-blur transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-foreground hover:border-primary/40",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {selected ? (
        <CheckCircle2 className="size-4" aria-hidden="true" />
      ) : (
        <Scale className="size-4" aria-hidden="true" />
      )}
    </button>
  )
}

export { MAX_COMPARE_ITEMS }