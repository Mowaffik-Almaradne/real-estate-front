"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { AdStatus } from "@/types/enums"
import { useAdsTranslations } from "../locales/useAdsTranslations"

interface AdStatusSelectProps {
  value: AdStatus
  onChange: (next: AdStatus) => void
  disabled?: boolean
  className?: string
}

export function AdStatusSelect({
  value,
  onChange,
  disabled,
  className,
}: AdStatusSelectProps) {
  const { t } = useAdsTranslations()
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as AdStatus)}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={AdStatus.draft}>{t("ads.status.draft")}</SelectItem>
        <SelectItem value={AdStatus.active}>{t("ads.status.active")}</SelectItem>
        <SelectItem value={AdStatus.paused}>{t("ads.status.paused")}</SelectItem>
        <SelectItem value={AdStatus.archived}>{t("ads.status.archived")}</SelectItem>
      </SelectContent>
    </Select>
  )
}
