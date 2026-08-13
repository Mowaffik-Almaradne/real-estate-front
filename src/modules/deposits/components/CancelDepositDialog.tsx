"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import { AlertCircle, Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ApiClientError } from "@/lib/apiClient"

import {
  cancelDepositSchema,
  type CancelDepositValues,
} from "../schemas"
import { depositService } from "../services/depositService"
import { getDepositLabel } from "../labels"
import type { DepositDto } from "../types/dto"

interface CancelDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deposit: DepositDto | null
  onCancelled?: (deposit: DepositDto) => void
}

export function CancelDepositDialog({
  open,
  onOpenChange,
  deposit,
  onCancelled,
}: CancelDepositDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CancelDepositValues>({
    resolver: zodResolver(cancelDepositSchema),
    defaultValues: { reason: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!deposit) return
    setServerError(null)
    try {
      const updated = await depositService.cancel(deposit.id, {
        reason: values.reason,
      })
      toast.success(label("deposits.toast.cancelled"))
      onCancelled?.(updated)
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiClientError) {
        setServerError(error.message || label("deposits.toast.cancelFailed"))
      } else {
        setServerError(label("deposits.toast.cancelFailed"))
      }
    }
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({ reason: "" })
      setServerError(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{label("deposits.cancelDialog.title")}</DialogTitle>
          <DialogDescription>
            {label("deposits.cancelDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <p className="font-medium">{serverError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">{label("deposits.fields.reason")}</Label>
            <Textarea
              id="cancel-reason"
              rows={3}
              placeholder={label("deposits.fields.cancellationReason")}
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="destructive">
              {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              <X className="size-4 mr-1" />
              {label("deposits.actions.cancel")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
