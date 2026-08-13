"use client"

import { Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"

import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

interface SubscriptionDeleteDialogProps {
  open: boolean
  submitting: boolean
  titleKey: string
  descriptionKey: string
  confirmKey: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
}

export function SubscriptionDeleteDialog({
  open,
  submitting,
  titleKey,
  descriptionKey,
  confirmKey,
  onOpenChange,
  onConfirm,
}: SubscriptionDeleteDialogProps) {
  const { t } = useSubscriptionsTranslations()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(titleKey)}</DialogTitle>
          <DialogDescription>{t(descriptionKey)}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t(confirmKey)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
