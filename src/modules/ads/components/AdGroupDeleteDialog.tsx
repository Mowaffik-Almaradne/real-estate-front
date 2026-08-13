"use client"

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

interface AdGroupDeleteDialogProps {
  open: boolean
  submitting: boolean
  onOpenChange: (next: boolean) => void
  onConfirm: () => Promise<void> | void
}

export function AdGroupDeleteDialog({
  open,
  submitting,
  onOpenChange,
  onConfirm,
}: AdGroupDeleteDialogProps) {
  const { t } = useAdsTranslations()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ads.groups.archive.title")}</DialogTitle>
          <DialogDescription>
            {t("ads.groups.archive.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={submitting}
          >
            {t("ads.groups.archive.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
