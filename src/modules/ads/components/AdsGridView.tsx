"use client"

import { Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import { AdDashboardCard } from "./AdDashboardCard"
import { useAdsTranslations } from "../locales/useAdsTranslations"
import type { AdDto } from "../types"

export interface PaginationInfo {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

interface AdsGridViewProps {
  ads: AdDto[]
  loading: boolean
  pagination: PaginationInfo
  defaultAdId?: number | null
  emptyMessage: string
  page: number
  onPageChange: (page: number) => void
  onEdit: (ad: AdDto) => void
  onArchive: (ad: AdDto) => void
  onRestore: (ad: AdDto) => Promise<unknown>
  onSetStatus: (ad: AdDto, status: AdDto["status"]) => Promise<unknown>
  onLinkProperty: (ad: AdDto) => void
  onUnlinkProperty: (ad: AdDto) => Promise<unknown>
  onSetDefault?: (ad: AdDto) => void
  onRemoveDefault?: (ad: AdDto) => Promise<unknown>
}

export function AdsGridView({
  ads,
  loading,
  pagination,
  defaultAdId,
  emptyMessage,
  page,
  onPageChange,
  onEdit,
  onArchive,
  onRestore,
  onSetStatus,
  onLinkProperty,
  onUnlinkProperty,
  onSetDefault,
  onRemoveDefault,
}: AdsGridViewProps) {
  const { t } = useAdsTranslations()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ads.map((ad) => (
          <AdDashboardCard
            key={ad.id}
            ad={ad}
            isDefaultAd={ad.id === defaultAdId || ad.is_default === true}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
            onSetStatus={onSetStatus}
            onLinkProperty={onLinkProperty}
            onUnlinkProperty={onUnlinkProperty}
            onSetDefault={onSetDefault}
            onRemoveDefault={onRemoveDefault}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          {t("common.showing", {
            from: pagination.from ?? 0,
            to: pagination.to ?? 0,
            total: pagination.total,
          })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
          >
            {t("common.previous")}
          </Button>
          <span className="text-sm">
            {t("common.page", {
              current: pagination.current_page,
              last: pagination.last_page,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(pagination.last_page, page + 1))}
            disabled={page >= pagination.last_page || loading}
          >
            {t("common.next")}
          </Button>
        </div>
      </div>
    </>
  )
}
