"use client"

import { cn } from "@/lib/utils"
import { SubscriptionStatus } from "@/types/enums"

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus | string
  className?: string
}

const STYLES: Record<string, string> = {
  [SubscriptionStatus.pending]:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
  [SubscriptionStatus.active]:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  [SubscriptionStatus.expired]:
    "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  [SubscriptionStatus.cancelled]:
    "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20",
}

export function SubscriptionStatusBadge({
  status,
  className,
}: SubscriptionStatusBadgeProps) {
  const styles = STYLES[status] ?? STYLES[SubscriptionStatus.pending]
  const label = String(status).replace(/^./, (c) => c.toUpperCase())
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
