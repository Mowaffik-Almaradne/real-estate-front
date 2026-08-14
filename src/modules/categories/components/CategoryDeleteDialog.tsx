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

import { useCategoriesTranslations } from "../locales/useCategoriesTranslations"

interface CategoryDeleteDialogProps {
  open: boolean
  submitting: boolean
  protectedCategory?: boolean
  onOpenChange: (next: boolean) => void
  onConfirm: () => Promise<void> | void
}

export function CategoryDeleteDialog({
  open,
  submitting,
  protectedCategory = false,
  onOpenChange,
  onConfirm,
}: CategoryDeleteDialogProps) {
  const { t } = useCategoriesTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("delete.title")}</DialogTitle>
          <DialogDescription>{t("delete.description")}</DialogDescription>
        </DialogHeader>
        {protectedCategory && (
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
            variant="destructive"
            onClick={onConfirm}
            disabled={submitting || protectedCategory}
            data-testid="category-delete-confirm"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("delete.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
