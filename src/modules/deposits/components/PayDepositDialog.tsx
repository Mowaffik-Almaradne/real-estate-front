"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import {
  AlertCircle,
  CreditCard,
  Loader2,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  payDepositSchema,
  type PayDepositValues,
} from "../schemas"
import { depositService } from "../services/depositService"
import { getDepositLabel, paymentMethodLabel } from "../labels"
import {
  PAYMENT_METHODS,
  PaymentMethod,
} from "../types/enums"
import type { DepositDto } from "../types/dto"

interface PayDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deposit: DepositDto | null
  onPaid?: (deposit: DepositDto) => void
}

export function PayDepositDialog({
  open,
  onOpenChange,
  deposit,
  onPaid,
}: PayDepositDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm<PayDepositValues>({
    resolver: zodResolver(payDepositSchema),
    defaultValues: {
      payment_method: PaymentMethod.balance,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!deposit) return
    setServerError(null)
    try {
      const updated = await depositService.pay(deposit.id, {
        payment_method: values.payment_method as PaymentMethod,
      })
      toast.success(label("deposits.toast.paid"))
      onPaid?.(updated)
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiClientError) {
        setServerError(error.message || label("deposits.toast.payFailed"))
      } else {
        setServerError(label("deposits.toast.payFailed"))
      }
    }
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({ payment_method: PaymentMethod.balance })
      setServerError(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{label("deposits.payDialog.title")}</DialogTitle>
          <DialogDescription>
            {label("deposits.payDialog.description")}
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
            <Label>{label("deposits.fields.paymentMethod")}</Label>
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as PaymentMethod)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        <span className="flex items-center gap-2">
                          {method === PaymentMethod.balance ? (
                            <Wallet className="size-3.5" />
                          ) : (
                            <CreditCard className="size-3.5" />
                          )}
                          {paymentMethodLabel(locale, method)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.payment_method && (
              <p className="text-xs text-destructive">
                {label("deposits.errors.paymentMethodRequired")}
              </p>
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
              {label("deposits.actions.pay")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
