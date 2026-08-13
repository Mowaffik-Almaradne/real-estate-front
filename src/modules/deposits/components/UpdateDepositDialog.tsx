"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import {
  AlertCircle,
  Coins,
  Loader2,
  Save,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  updateDepositSchema,
  type UpdateDepositValues,
} from "../schemas"
import { depositService } from "../services/depositService"
import { getDepositLabel } from "../labels"
import type { DepositDto } from "../types/dto"

interface UpdateDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deposit: DepositDto | null
  onUpdated?: (deposit: DepositDto) => void
}

export function UpdateDepositDialog({
  open,
  onOpenChange,
  deposit,
  onUpdated,
}: UpdateDepositDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<UpdateDepositValues>({
    resolver: zodResolver(updateDepositSchema),
    defaultValues: {
      amount: 0,
      terms: "",
      notes: "",
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (open && !next && deposit) {
      reset({
        amount: deposit.amount as number,
        terms: deposit.terms ?? "",
        notes: deposit.notes ?? "",
      })
      setServerError(null)
    }
    onOpenChange(next)
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!deposit) return
    setServerError(null)
    try {
      const updated = await depositService.update(deposit.id, {
        amount:
          values.amount === undefined || values.amount === null
            ? undefined
            : Number(values.amount),
        terms: values.terms ?? null,
        notes: values.notes ?? null,
      })
      toast.success(label("deposits.toast.updated"))
      onUpdated?.(updated)
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiClientError) {
        setServerError(error.message || label("deposits.toast.updateFailed"))
      } else {
        setServerError(label("deposits.toast.updateFailed"))
      }
    }
  })

  if (!deposit) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next && deposit) {
          reset({
            amount: deposit.amount as number,
            terms: deposit.terms ?? "",
            notes: deposit.notes ?? "",
          })
          setServerError(null)
        }
        handleOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{label("deposits.updateDialog.title")}</DialogTitle>
          <DialogDescription>
            Only pending deposits can be updated.
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
            <Label htmlFor="update-amount">{label("deposits.fields.amount")}</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="update-amount"
                type="number"
                step="0.01"
                min={0.01}
                className="pl-9"
                {...register("amount")}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-terms">{label("deposits.fields.terms")}</Label>
            <Textarea id="update-terms" rows={3} {...register("terms")} />
            {errors.terms && (
              <p className="text-xs text-destructive">{errors.terms.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-notes">{label("deposits.fields.notes")}</Label>
            <Textarea id="update-notes" rows={2} {...register("notes")} />
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
              <Save className="size-4 mr-1" />
              {label("deposits.actions.update")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
