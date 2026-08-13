"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import { AlertCircle, Calendar as CalendarIcon, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  updateRentalCardSchema,
  type UpdateRentalCardValues,
} from "../schemas"
import { rentalCardService } from "../services/rentalCardService"
import { getRentalCardLabel } from "../labels"
import type { RentalCardDto } from "../types/dto"

interface UpdateRentalCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: RentalCardDto | null
  onUpdated?: (card: RentalCardDto) => void
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return ""
  return value.slice(0, 10)
}

export function UpdateRentalCardDialog({
  open,
  onOpenChange,
  card,
  onUpdated,
}: UpdateRentalCardDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getRentalCardLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateRentalCardValues>({
    resolver: zodResolver(updateRentalCardSchema),
    defaultValues: {
      end_date: "",
      terms: "",
      notes: "",
      is_renewable: false,
    },
  })

  useEffect(() => {
    if (open && card) {
      reset({
        end_date: toDateInput(card.end_date),
        terms: card.terms ?? "",
        notes: card.notes ?? "",
        is_renewable: Boolean(card.is_renewable),
      })
    }
  }, [open, card, reset])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setServerError(null)
    }
    onOpenChange(next)
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!card) return
    setServerError(null)
    try {
      const updated = await rentalCardService.update(card.id, {
        end_date: values.end_date || undefined,
        terms: values.terms ?? null,
        notes: values.notes ?? null,
        is_renewable:
          typeof values.is_renewable === "boolean" ? values.is_renewable : null,
      })
      toast.success(label("rentalCards.toast.updated"))
      onUpdated?.(updated)
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiClientError) {
        setServerError(error.message || label("rentalCards.toast.updateFailed"))
      } else {
        setServerError(label("rentalCards.toast.updateFailed"))
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{label("rentalCards.updateDialog.title")}</DialogTitle>
          <DialogDescription>
            Only end date, terms, notes, and renewable flag can be updated.
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
            <Label htmlFor="end_date">{label("rentalCards.fields.endDate")}</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="end_date"
                type="date"
                className="pl-9"
                {...register("end_date")}
              />
            </div>
            {errors.end_date && (
              <p className="text-xs text-destructive">{errors.end_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">{label("rentalCards.fields.terms")}</Label>
            <Textarea id="terms" rows={3} {...register("terms")} />
            {errors.terms && (
              <p className="text-xs text-destructive">{errors.terms.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{label("rentalCards.fields.notes")}</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="is_renewable" className="text-sm">
                {label("rentalCards.fields.isRenewable")}
              </Label>
            </div>
            <Controller
              control={control}
              name="is_renewable"
              render={({ field }) => (
                <Switch
                  id="is_renewable"
                  checked={Boolean(field.value)}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                />
              )}
            />
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
              {label("rentalCards.actions.edit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
