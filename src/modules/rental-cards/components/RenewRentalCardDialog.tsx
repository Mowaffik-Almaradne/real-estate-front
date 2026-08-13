"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import { AlertCircle, Calendar as CalendarIcon, Loader2, RefreshCw } from "lucide-react"
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
  renewRentalCardSchema,
  type RenewRentalCardValues,
} from "../schemas"
import { rentalCardService } from "../services/rentalCardService"
import { getRentalCardLabel } from "../labels"
import type { RentalCardDto } from "../types/dto"

interface RenewRentalCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: RentalCardDto | null
  onRenewed?: (card: RentalCardDto) => void
}

function todayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function RenewRentalCardDialog({
  open,
  onOpenChange,
  card,
  onRenewed,
}: RenewRentalCardDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getRentalCardLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)

  const minimumDate = card?.end_date
    ? card.end_date.slice(0, 10) < todayIso()
      ? todayIso()
      : card.end_date.slice(0, 10)
    : todayIso()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RenewRentalCardValues>({
    resolver: zodResolver(renewRentalCardSchema),
    defaultValues: {
      end_date: minimumDate,
      terms: card?.terms ?? "",
      notes: card?.notes ?? "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!card) return
    setServerError(null)
    try {
      const updated = await rentalCardService.renew(card.id, {
        end_date: values.end_date,
        terms: values.terms ?? null,
        notes: values.notes ?? null,
      })
      toast.success(label("rentalCards.toast.renewed"))
      onRenewed?.(updated)
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (
          error.isServerError() &&
          error.message.toLowerCase().includes("renewable")
        ) {
          setServerError(label("rentalCards.errors.notRenewable"))
        } else {
          setServerError(error.message || label("rentalCards.toast.renewFailed"))
        }
      } else {
        setServerError(label("rentalCards.toast.renewFailed"))
      }
    }
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({ end_date: minimumDate, terms: card?.terms ?? "", notes: card?.notes ?? "" })
      setServerError(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{label("rentalCards.renewDialog.title")}</DialogTitle>
          <DialogDescription>{label("rentalCards.renewDialog.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <p className="font-medium">{serverError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="end_date">{label("rentalCards.fields.renewedTo")}</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="end_date"
                type="date"
                min={minimumDate}
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
              <RefreshCw className="size-4 mr-1" />
              {label("rentalCards.actions.renew")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
