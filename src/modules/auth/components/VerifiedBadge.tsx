import { BadgeCheck } from "lucide-react"

import { cn } from "@/lib/utils"

type Variant = "default" | "muted" | "outline"

interface VerifiedBadgeProps {
  verified: boolean | null | undefined
  label?: string
  variant?: Variant
  className?: string
  showIcon?: boolean
  title?: string
}

const VARIANT_CLASS: Record<Variant, string> = {
  default: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  muted: "bg-muted text-muted-foreground border-border",
  outline: "border-border text-muted-foreground",
}

export function VerifiedBadge({
  verified,
  label = "Verified",
  variant = "default",
  className,
  showIcon = true,
  title,
}: VerifiedBadgeProps) {
  if (!verified) return null
  return (
    <span
      title={title ?? label}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        VARIANT_CLASS[variant],
        className
      )}
    >
      {showIcon && <BadgeCheck className="size-3" />}
      {label}
    </span>
  )
}
