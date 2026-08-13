"use client"

import { cn } from "@/lib/utils"
import { AdStatus } from "@/types/enums"

interface AdStatusBadgeProps {
  status: AdStatus
  className?: string
}

const STYLES: Record<AdStatus, string> = {
  [AdStatus.draft]: "bg-muted text-muted-foreground border-border",
  [AdStatus.active]: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  [AdStatus.paused]: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
  [AdStatus.archived]: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
}

export function AdStatusBadge({ status, className }: AdStatusBadgeProps) {
  const styles = STYLES[status] ?? STYLES[AdStatus.draft]
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles,
        className
      )}
    >
      {label}
    </span>
  )
}
