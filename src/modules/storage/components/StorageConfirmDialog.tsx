"use client"

import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { useStorageTranslations } from "../locales/useStorageTranslations"

interface StorageConfirmDialogProps {
  open: boolean
  submitting: boolean
  title: string
  description: string
  protectedEntity?: boolean
  confirmLabel: string
  onOpenChange: (next: boolean) => void
  onConfirm: () => Promise<void> | void
  destructive?: boolean
}

export function StorageConfirmDialog({
  open,
  submitting,
  title,
  description,
  protectedEntity = false,
  confirmLabel,
  onOpenChange,
  onConfirm,
  destructive = true,
}: StorageConfirmDialogProps) {
  const { t } = useStorageTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {protectedEntity && (
          <p className="text-xs text-destructive">{t("delete.protected")}</p>
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
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={submitting || protectedEntity}
            data-testid="storage-confirm"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
