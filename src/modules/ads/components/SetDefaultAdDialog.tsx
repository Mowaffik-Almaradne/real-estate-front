"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"
import { Button } from "components/ui/button"
import { useAdsTranslations } from "../locales/useAdsTranslations"
import { adService } from "../services/adService"
import type { AdDto } from "../types"

interface SetDefaultAdDialogProps {
  open: boolean
  groupId: number | null
  currentDefaultId?: number | null
  onOpenChange: (next: boolean) => void
  onConfirm: (adId: number) => Promise<unknown>
}

export function SetDefaultAdDialog({
  open,
  groupId,
  currentDefaultId,
  onOpenChange,
  onConfirm,
}: SetDefaultAdDialogProps) {
  const { t } = useAdsTranslations()
  const [ads, setAds] = useState<AdDto[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || groupId == null) return
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const response = await adService.list({ ad_group_id: groupId, perPage: 100 })
        if (cancelled) return
        setAds(response.data)
      } catch {
        if (!cancelled) setAds([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, groupId])

  useEffect(() => {
    if (!open) {
      Promise.resolve().then(() => setSelectedId(null))
    }
  }, [open])

  const candidate = ads.find((ad) => ad.id === selectedId) ?? null
  const isAlreadyDefault =
    currentDefaultId != null && currentDefaultId === selectedId

  const handleSubmit = async () => {
    if (selectedId == null) return
    setSubmitting(true)
    try {
      await onConfirm(selectedId)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ads.setDefault.title")}</DialogTitle>
          <DialogDescription>{t("ads.setDefault.description")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : ads.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-center text-sm text-muted-foreground">
            {t("ads.noGroupSelected")}
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-md border border-border">
            <ul className="divide-y divide-border">
              {ads.map((ad) => {
                const isSelected = ad.id === selectedId
                return (
                  <li key={ad.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(ad.id)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-accent ${
                        isSelected ? "bg-accent" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{ad.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {ad.media_type}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-xs font-medium text-primary">
                          {t("common.selected")}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {isAlreadyDefault && (
          <p className="text-xs text-muted-foreground">
            {t("ads.setDefault.alreadyDefault")}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || isAlreadyDefault || candidate == null}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("ads.setDefault.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
