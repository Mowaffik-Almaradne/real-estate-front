"use client"

import { useTranslations } from "next-intl"
import { WifiOff } from "lucide-react"

import { useOnlineStatus } from "src/lib/use-online"

export function OfflineBanner() {
  const t = useTranslations("pwa")
  const isOnline = useOnlineStatus()
  if (isOnline) return null
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offline-banner"
      className="flex items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300"
    >
      <WifiOff className="size-3.5" aria-hidden />
      <span>{t("offline")}</span>
    </div>
  )
}