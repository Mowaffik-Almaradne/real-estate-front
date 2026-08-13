"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"

import { subscriptionLifecycleService } from "./service"
import { ApiClientError } from "@/lib/apiClient"
import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

interface CancelSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancelled: () => void | Promise<void>
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onCancelled,
}: CancelSubscriptionDialogProps) {
  const { t } = useSubscriptionsTranslations()
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await subscriptionLifecycleService.cancel()
      toast.success(t("lifecycle.cancel.success"))
      await onCancelled()
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : t("errors.saveFailed")
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("lifecycle.cancel.title")}</DialogTitle>
          <DialogDescription>
            {t("lifecycle.cancel.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("lifecycle.cancel.keep")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("lifecycle.cancel.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
