"use client"

import { Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import { AdGroupCard } from "./AdGroupCard"
import { useAdsTranslations } from "../locales/useAdsTranslations"
import type { AdGroupDto } from "../types"

export interface AdGroupsPaginationInfo {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

interface AdGroupsGridProps {
  groups: AdGroupDto[]
  loading: boolean
  pagination: AdGroupsPaginationInfo
  page: number
  emptyMessage: string
  onPageChange: (page: number) => void
  onEdit: (group: AdGroupDto) => void
  onArchive: (group: AdGroupDto) => void
  onRestore: (group: AdGroupDto) => Promise<unknown>
  onSetDefault?: (group: AdGroupDto) => void
  onRemoveDefault?: (group: AdGroupDto) => Promise<unknown>
}

export function AdGroupsGrid({
  groups,
  loading,
  pagination,
  page,
  emptyMessage,
  onPageChange,
  onEdit,
  onArchive,
  onRestore,
  onSetDefault,
  onRemoveDefault,
}: AdGroupsGridProps) {
  const { t } = useAdsTranslations()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groups.map((group) => (
          <AdGroupCard
            key={group.id}
            group={group}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
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
