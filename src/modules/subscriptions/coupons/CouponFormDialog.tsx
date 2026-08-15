"use client"

import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Switch } from "components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"

import {
  subscriptionDiscountFormSchema,
  type SubscriptionDiscountFormValues,
} from "./schemas"
import { adminCouponService } from "./service"
import type { SubscriptionDiscount } from "./types"
import { ApiClientError, toFormErrors } from "@/lib/apiClient"
import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

interface SubscriptionCouponFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: SubscriptionDiscount | null
  onSaved: (coupon: SubscriptionDiscount, isUpdate: boolean) => void
}

export function SubscriptionCouponFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: SubscriptionCouponFormDialogProps) {
  const { t } = useSubscriptionsTranslations()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionDiscountFormValues>({
    resolver: zodResolver(subscriptionDiscountFormSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0,
      plan_id: null,
      max_uses: null,
      expires_at: null,
      is_active: true,
    },
  })

  useEffect(() => {
    if (!open) return
    void Promise.resolve().then(() => {
      if (editing) {
        reset({
          code: editing.code,
          type: editing.type,
          value: editing.value,
          plan_id: editing.plan_id,
          max_uses: editing.max_uses,
          expires_at: editing.expires_at,
          is_active: editing.is_active,
        })
      } else {
        reset({
          code: "",
          type: "percentage",
          value: 0,
          plan_id: null,
          max_uses: null,
          expires_at: null,
          is_active: true,
        })
      }
    })
  }, [open, editing, reset])

  const currentType = useWatch({ control, name: "type" })
  const isActive = useWatch({ control, name: "is_active" })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        code: values.code.trim(),
        type: values.type,
        value: values.value,
        plan_id: values.plan_id ?? null,
        max_uses: values.max_uses ?? null,
        expires_at: values.expires_at ?? null,
        is_active: values.is_active,
      }
      if (editing) {
        const updated = await adminCouponService.update(editing.id, payload)
        toast.success(t("coupons.form.successUpdate"))
        onSaved(updated, true)
      } else {
        const created = await adminCouponService.create(payload)
        toast.success(t("coupons.form.successCreate"))
        onSaved(created, false)
      }
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fieldErrors = toFormErrors<SubscriptionDiscountFormValues>(err.errors)
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (message)
            setError(field as keyof SubscriptionDiscountFormValues, { message })
        }
        toast.error(err.message)
      } else {
        toast.error(t("errors.saveFailed"))
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("coupons.editCoupon") : t("coupons.newCoupon")}
          </DialogTitle>
          <DialogDescription>{t("coupons.subtitle")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-code">{t("coupons.form.codeLabel")}</Label>
              <Input
                id="coupon-code"
                placeholder={t("coupons.form.codePlaceholder")}
                {...register("code")}
              />
              {errors.code?.message && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("coupons.form.typeLabel")}</Label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm ${
                    currentType === "percentage"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    value="percentage"
                    checked={currentType === "percentage"}
                    onChange={() =>
                      setValue("type", "percentage", { shouldDirty: true })
                    }
                    className="mt-1 size-4 accent-primary"
                  />
                  <span>{t("coupons.form.typePercentage")}</span>
                </label>
                <label
                  className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm ${
                    currentType === "fixed"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    value="fixed"
                    checked={currentType === "fixed"}
                    onChange={() =>
                      setValue("type", "fixed", { shouldDirty: true })
                    }
                    className="mt-1 size-4 accent-primary"
                  />
                  <span>{t("coupons.form.typeFixed")}</span>
                </label>
              </div>
              {errors.type?.message && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-value">{t("coupons.form.valueLabel")}</Label>
              <Input
                id="coupon-value"
                type="number"
                min={0}
                step="0.01"
                placeholder={t("coupons.form.valuePlaceholder")}
                {...register("value", { valueAsNumber: true })}
              />
              {errors.value?.message && (
                <p className="text-xs text-destructive">{errors.value.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-max-uses">
                {t("coupons.form.maxUsesLabel")}
              </Label>
              <Input
                id="coupon-max-uses"
                type="number"
                min={1}
                placeholder={t("coupons.form.maxUsesPlaceholder")}
                {...register("max_uses", {
                  setValueAs: (value) =>
                    value === "" || value == null ? null : Number(value),
                })}
              />
              {errors.max_uses?.message && (
                <p className="text-xs text-destructive">{errors.max_uses.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-expires-at">
                {t("coupons.form.expiresAtLabel")}
              </Label>
              <Input
                id="coupon-expires-at"
                type="date"
                {...register("expires_at", {
                  setValueAs: (value) => (value === "" ? null : value),
                })}
              />
              {errors.expires_at?.message && (
                <p className="text-xs text-destructive">{errors.expires_at.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-plan-id">{t("coupons.form.planIdLabel")}</Label>
              <Input
                id="coupon-plan-id"
                type="number"
                min={1}
                placeholder={t("coupons.form.planIdPlaceholder")}
                {...register("plan_id", {
                  setValueAs: (value) =>
                    value === "" || value == null ? null : Number(value),
                })}
              />
              {errors.plan_id?.message && (
                <p className="text-xs text-destructive">{errors.plan_id.message}</p>
              )}
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{t("coupons.form.activeLabel")}</p>
              </div>
              <Switch
                checked={Boolean(isActive)}
                onCheckedChange={(checked) =>
                  setValue("is_active", checked, { shouldDirty: true })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? t("coupons.form.save") : t("coupons.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
