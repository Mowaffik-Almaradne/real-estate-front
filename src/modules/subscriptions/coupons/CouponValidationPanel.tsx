"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Loader2, Tag, X } from "lucide-react"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"

import {
  validateCouponRequestSchema,
  type ValidateCouponFormValues,
} from "./schemas"
import { useCouponValidation } from "./hooks"
import { ApiClientError } from "@/lib/apiClient"
import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

interface CouponValidationPanelProps {
  planId?: number | null
  planPrice?: number | null
  currency?: string | null
  onApplied?: (info: {
    code: string
    discount_amount: number
    final_amount: number
  }) => void
  onCleared?: () => void
}

export function CouponValidationPanel({
  planId,
  planPrice,
  currency,
  onApplied,
  onCleared,
}: CouponValidationPanelProps) {
  const { t } = useSubscriptionsTranslations()
  const { result, loading, error, validate, reset } = useCouponValidation()
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ValidateCouponFormValues>({
    resolver: zodResolver(validateCouponRequestSchema),
    defaultValues: { code: "", plan_id: planId ?? null },
  })

  useEffect(() => {
    if (planId != null) resetForm({ code: "", plan_id: planId })
  }, [planId, resetForm])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await validate({
        code: values.code.trim(),
        plan_id: values.plan_id ?? planId ?? null,
      })
      if (response.valid) {
        setAppliedCode(response.code ?? values.code.trim())
        onApplied?.({
          code: response.code ?? values.code.trim(),
          discount_amount: response.discount_amount ?? 0,
          final_amount: response.final_amount ?? planPrice ?? 0,
        })
      } else {
        setAppliedCode(null)
        onCleared?.()
      }
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to validate coupon"
      setAppliedCode(null)
      onCleared?.()
      // toast would be shown at parent level; swallow the error here
      void message
    }
  })

  const handleClear = () => {
    setAppliedCode(null)
    reset()
    resetForm({ code: "", plan_id: planId ?? null })
    onCleared?.()
  }

  const formatAmount = (value: number | undefined | null): string => {
    if (value == null) return "—"
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-primary" />
        <h3 className="text-sm font-medium">{t("coupons.validation.title")}</h3>
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="coupon-apply-code">
            {t("coupons.validation.codeLabel")}
          </Label>
          <Input
            id="coupon-apply-code"
            placeholder={t("coupons.validation.codePlaceholder")}
            {...register("code")}
            disabled={Boolean(appliedCode)}
          />
          {errors.code?.message && (
            <p className="text-xs text-destructive">{errors.code.message}</p>
          )}
        </div>
        <Button type="submit" disabled={loading || Boolean(appliedCode)}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {t("coupons.validation.apply")}
        </Button>
      </form>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {result && !result.valid && (
        <p className="text-xs text-destructive">
          {result.message ?? t("coupons.validation.invalid")}
        </p>
      )}

      {appliedCode && result?.valid && (
        <div className="flex items-start justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 text-emerald-600" />
            <div>
              <p className="font-medium">{appliedCode}</p>
              <p className="text-xs text-muted-foreground">
                {t("coupons.validation.applied")}
              </p>
              {result.discount_amount != null && (
                <p className="mt-1 text-xs">
                  {t("coupons.validation.youSave", {
                    amount: formatAmount(result.discount_amount),
                    currency: currency ?? "",
                  })}
                </p>
              )}
              {result.final_amount != null && planPrice != null && (
                <p className="text-xs">
                  {t("coupons.validation.finalAmount", {
                    from: formatAmount(planPrice),
                    to: formatAmount(result.final_amount),
                    currency: currency ?? "",
                  })}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="text-muted-foreground transition hover:text-foreground"
            onClick={handleClear}
            aria-label={t("coupons.validation.remove")}
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
