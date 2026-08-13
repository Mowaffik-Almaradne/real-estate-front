"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react"
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
  releaseDepositSchema,
  type ReleaseDepositValues,
} from "../schemas"
import { depositService } from "../services/depositService"
import { getDepositLabel } from "../labels"
import type { DepositDto } from "../types/dto"

interface ReleaseDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deposit: DepositDto | null
  onReleased?: (deposit: DepositDto) => void
}

export function ReleaseDepositDialog({
  open,
  onOpenChange,
  deposit,
  onReleased,
}: ReleaseDepositDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ReleaseDepositValues>({
    resolver: zodResolver(releaseDepositSchema),
    defaultValues: { notes: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!deposit) return
    setServerError(null)
    try {
      const updated = await depositService.release(deposit.id, {
        notes: values.notes ?? null,
      })
      toast.success(label("deposits.toast.released"))
      onReleased?.(updated)
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiClientError) {
        setServerError(error.message || label("deposits.toast.releaseFailed"))
      } else {
        setServerError(label("deposits.toast.releaseFailed"))
      }
    }
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({ notes: "" })
      setServerError(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{label("deposits.releaseDialog.title")}</DialogTitle>
          <DialogDescription>
            {label("deposits.releaseDialog.description")}
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
            <Label htmlFor="release-notes">
              {label("deposits.fields.releaseNotes")}
            </Label>
            <Textarea id="release-notes" rows={3} {...register("notes")} />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              <ArrowRight className="size-4 mr-1" />
              {label("deposits.actions.release")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
