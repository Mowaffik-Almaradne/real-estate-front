"use client"

import { useState } from "react"
import { Pencil, Trash2, RotateCcw, Star, StarOff, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "components/ui/button"
import { useAdsTranslations } from "../locales/useAdsTranslations"
import type { AdGroupDto } from "../types"

interface AdGroupCardProps {
  group: AdGroupDto
  onEdit: (group: AdGroupDto) => void
  onArchive: (group: AdGroupDto) => void
  onRestore: (group: AdGroupDto) => Promise<unknown>
  onSetDefault?: (group: AdGroupDto) => void
  onRemoveDefault?: (group: AdGroupDto) => Promise<unknown>
}

function statusClass(status: AdGroupDto["status"]): string {
  if (status === "active") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
  }
  return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20"
}

export function AdGroupCard({
  group,
  onEdit,
  onArchive,
  onRestore,
  onSetDefault,
  onRemoveDefault,
}: AdGroupCardProps) {
  const { t } = useAdsTranslations()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const run = async (key: string, action: () => Promise<unknown>) => {
    if (busy) return
    setBusy(key)
    try {
      await action()
    } finally {
      setBusy(null)
    }
  }

  const isArchived = group.is_archived === true
  const label = group.status.charAt(0).toUpperCase() + group.status.slice(1)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{group.name}</h3>
          {group.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {group.description}
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass(group.status)}`}
        >
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-border/60 bg-muted/30 p-2">
          <p className="text-muted-foreground">{t("ads.groups.columns.adsCount")}</p>
          <p className="text-base font-semibold">{group.ads_count ?? "—"}</p>
        </div>
        <div className="rounded-md border border-border/60 bg-muted/30 p-2">
          <p className="text-muted-foreground">{t("ads.groups.columns.defaultAd")}</p>
          <p className="truncate text-sm font-medium">
            {group.default_ad?.title ?? t("ads.groups.detail.noDefaultAd")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-t border-border pt-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push(`/dashboard/ad-groups/${group.id}`)}
          aria-label={t("ads.groups.actions.view")}
        >
          <Eye className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(group)}
          disabled={Boolean(busy) || isArchived}
          aria-label={t("ads.groups.actions.edit")}
        >
          <Pencil className="size-4" />
        </Button>
        {isArchived ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void run("restore", () => onRestore(group))}
            disabled={Boolean(busy)}
            aria-label={t("ads.groups.actions.restore")}
          >
            <RotateCcw className="size-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onArchive(group)}
            disabled={Boolean(busy)}
            aria-label={t("ads.groups.actions.archive")}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
        {onSetDefault && !isArchived && !group.default_ad_id && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onSetDefault(group)}
            disabled={Boolean(busy)}
            aria-label={t("ads.groups.actions.setDefault")}
          >
            <Star className="size-4" />
          </Button>
        )}
        {onRemoveDefault && group.default_ad_id && !isArchived && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void run("removeDefault", () => onRemoveDefault(group))}
            disabled={Boolean(busy)}
            aria-label={t("ads.groups.actions.removeDefault")}
          >
            <StarOff className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
