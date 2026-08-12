"use client"

import { useTranslations } from "next-intl"
import { Wifi, WifiOff } from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  const t = useTranslations("chat")

  if (isConnected) {
    return (
      <div role="status" className="flex items-center gap-1.5 text-emerald-600">
        <Wifi className="size-3.5" aria-hidden />
        <span className="text-xs font-medium">{t("live")}</span>
        <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
      </div>
    )
  }

  return (
    <div role="status" className="flex items-center gap-1.5 text-amber-600">
      <WifiOff className="size-3.5" aria-hidden />
      <span className="text-xs font-medium">{t("reconnecting")}</span>
      <span className="size-2 animate-pulse rounded-full bg-amber-500" aria-hidden />
    </div>
  )
}
