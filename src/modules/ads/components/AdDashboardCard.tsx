"use client"

import Image from "next/image"
import { useState } from "react"
import { ExternalLink, Film, Image as ImageIcon, Pencil, Power, RotateCcw, Trash2, Eye, Link2, Link2Off, Star, StarOff } from "lucide-react"

import { Button } from "components/ui/button"
import { cn } from "@/lib/utils"
import { AdStatus } from "@/types/enums"
import { AdStatusBadge } from "./AdStatusBadge"
import { useAdsTranslations } from "../locales/useAdsTranslations"
import type { AdDto } from "../types"

interface AdDashboardCardProps {
  ad: AdDto
  isDefaultAd?: boolean
  onEdit: (ad: AdDto) => void
  onArchive: (ad: AdDto) => void
  onRestore: (ad: AdDto) => Promise<unknown>
  onSetStatus: (ad: AdDto, status: AdStatus) => Promise<unknown>
  onLinkProperty: (ad: AdDto) => void
  onUnlinkProperty: (ad: AdDto) => Promise<unknown>
  onSetDefault?: (ad: AdDto) => void
  onRemoveDefault?: (ad: AdDto) => Promise<unknown>
}

function pickPreview(ad: AdDto): string | null {
  const first = ad.media?.[0]
  if (!first) return null
  return first.thumb_url ?? first.url ?? null
}

function formatSchedule(start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  const startLabel = start ? new Date(start).toLocaleDateString(undefined, opts) : "—"
  const endLabel = end ? new Date(end).toLocaleDateString(undefined, opts) : "—"
  return `${startLabel} → ${endLabel}`
}

export function AdDashboardCard({
  ad,
  isDefaultAd = false,
  onEdit,
  onArchive,
  onRestore,
  onSetStatus,
  onLinkProperty,
  onUnlinkProperty,
  onSetDefault,
  onRemoveDefault,
}: AdDashboardCardProps) {
  const { t } = useAdsTranslations()
  const [busy, setBusy] = useState<string | null>(null)
  const preview = pickPreview(ad)
  const schedule = formatSchedule(ad.start_date, ad.end_date)

  const run = async (key: string, action: () => Promise<unknown>) => {
    if (busy) return
    setBusy(key)
    try {
      await action()
    } finally {
      setBusy(null)
    }
  }

  const showSetDefault = Boolean(onSetDefault)
  const showRemoveDefault = Boolean(onRemoveDefault) && isDefaultAd

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      <div className="relative h-40 bg-muted">
        {preview ? (
          <Image
            src={preview}
            alt={ad.title}
            width={400}
            height={240}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            {ad.media_type === "video" ? (
              <Film className="size-10" />
            ) : (
              <ImageIcon className="size-10" />
            )}
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <AdStatusBadge status={ad.status} />
          {isDefaultAd && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
              <Star className="size-3" />
              {t("ads.detail.defaultBadge")}
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/90 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {ad.media_type === "video" ? (
            <>
              <Film className="size-3" />
              {t("ads.form.mediaTypeVideo")}
            </>
          ) : (
            <>
              <ImageIcon className="size-3" />
              {t("ads.form.mediaTypeImage")}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{ad.title}</h3>
            {ad.ad_group && (
              <p className="truncate text-xs text-muted-foreground">
                {ad.ad_group.name}
              </p>
            )}
          </div>
        </div>

        {ad.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {ad.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {ad.property?.name && (
            <span className="inline-flex items-center gap-1 truncate">
              <Link2 className="size-3" />
              <span className="truncate">{ad.property.name}</span>
            </span>
          )}
          {ad.external_url && (
            <span className="inline-flex items-center gap-1 truncate">
              <ExternalLink className="size-3" />
              <span className="truncate">{ad.external_url}</span>
            </span>
          )}
        </div>

        {schedule && (
          <p className="text-xs text-muted-foreground">
            {t("ads.detail.schedule")}: {schedule}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1 border-t border-border pt-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(ad)}
            disabled={Boolean(busy)}
            aria-label={t("ads.actions.edit")}
          >
            <Pencil className="size-4" />
          </Button>
          {ad.status === AdStatus.archived ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => void run("restore", () => onRestore(ad))}
              disabled={Boolean(busy)}
              aria-label={t("ads.actions.restore")}
            >
              <RotateCcw className="size-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onArchive(ad)}
              disabled={Boolean(busy)}
              aria-label={t("ads.actions.delete")}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
          {ad.status !== AdStatus.archived &&
            (ad.status === AdStatus.paused ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => void run("resume", () => onSetStatus(ad, AdStatus.active))}
                disabled={Boolean(busy)}
                aria-label={t("ads.actions.resume")}
              >
                <Power className="size-4" />
              </Button>
            ) : ad.status === AdStatus.active ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => void run("pause", () => onSetStatus(ad, AdStatus.paused))}
                disabled={Boolean(busy)}
                aria-label={t("ads.actions.pause")}
              >
                <Power className="size-4" />
              </Button>
            ) : null)}
          {ad.status !== AdStatus.archived && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onLinkProperty(ad)}
              disabled={Boolean(busy)}
              aria-label={t("ads.actions.linkProperty")}
            >
              <Eye className="size-4" />
            </Button>
          )}
          {ad.property_id ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => void run("unlink", () => onUnlinkProperty(ad))}
              disabled={Boolean(busy)}
              aria-label={t("ads.actions.unlinkProperty")}
            >
              <Link2Off className="size-4" />
            </Button>
          ) : null}
          {showSetDefault && !isDefaultAd && ad.status !== AdStatus.archived && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onSetDefault?.(ad)}
              disabled={Boolean(busy)}
              aria-label={t("ads.actions.setDefault")}
            >
              <Star className="size-4" />
            </Button>
          )}
          {showRemoveDefault && isDefaultAd && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => void run("removeDefault", () => onRemoveDefault?.(ad) ?? Promise.resolve())}
              disabled={Boolean(busy)}
              aria-label={t("ads.actions.removeDefault")}
            >
              <StarOff className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {ad.is_default && (
        <span className={cn("sr-only")}>{t("ads.detail.defaultBadge")}</span>
      )}
    </div>
  )
}
