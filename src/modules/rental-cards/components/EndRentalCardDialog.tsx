"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import { AlertCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react"
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
  endRentalCardSchema,
  type EndRentalCardValues,
} from "../schemas"
import { rentalCardService } from "../services/rentalCardService"
import { getRentalCardLabel } from "../labels"
import type { RentalCardDto } from "../types/dto"

interface EndRentalCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: RentalCardDto | null
  onEnded?: (card: RentalCardDto) => void
}

function todayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function EndRentalCardDialog({
  open,
  onOpenChange,
  card,
  onEnded,
}: EndRentalCardDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getRentalCardLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EndRentalCardValues>({
    resolver: zodResolver(endRentalCardSchema),
    defaultValues: {
      ended_at: todayIso(),
      end_reason: "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!card) return
    setServerError(null)
    try {
      const updated = await rentalCardService.end(card.id, {
        ended_at: values.ended_at || null,
        end_reason: values.end_reason || null,
      })
      toast.success(label("rentalCards.toast.ended"))
      onEnded?.(updated)
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (
          error.isServerError() &&
          error.message.toLowerCase().includes("not active")
        ) {
          setServerError(label("rentalCards.errors.endNotActive"))
        } else {
          setServerError(error.message || label("rentalCards.toast.endFailed"))
        }
      } else {
        setServerError(label("rentalCards.toast.endFailed"))
      }
    }
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({ ended_at: todayIso(), end_reason: "" })
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
          <DialogTitle>{label("rentalCards.endDialog.title")}</DialogTitle>
          <DialogDescription>{label("rentalCards.endDialog.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <p className="font-medium">{serverError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ended_at">{label("rentalCards.fields.endedAt")}</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="ended_at"
                type="date"
                max={todayIso()}
                className="pl-9"
                {...register("ended_at")}
              />
            </div>
            {errors.ended_at && (
              <p className="text-xs text-destructive">
                {label("rentalCards.errors.endBeforeToday")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_reason">{label("rentalCards.fields.endReason")}</Label>
            <Textarea
              id="end_reason"
              rows={3}
              placeholder="Tenant moved abroad"
              {...register("end_reason")}
            />
            {errors.end_reason && (
              <p className="text-xs text-destructive">{errors.end_reason.message}</p>
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
              {label("rentalCards.actions.end")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
