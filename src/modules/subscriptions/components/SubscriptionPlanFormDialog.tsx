"use client"

import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Textarea } from "components/ui/textarea"
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
  subscriptionPlanFormSchema,
  type SubscriptionPlanFormValues,
} from "../schemas"
import { adminSubscriptionPlanService } from "../services/subscriptionService"
import type { SubscriptionPlan } from "../types"
import { ApiClientError, toFormErrors } from "@/lib/apiClient"
import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

interface SubscriptionPlanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: SubscriptionPlan | null
  onSaved: (plan: SubscriptionPlan, isUpdate: boolean) => void
}

export function SubscriptionPlanFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: SubscriptionPlanFormDialogProps) {
  const { t } = useSubscriptionsTranslations()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionPlanFormValues>({
    resolver: zodResolver(subscriptionPlanFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      currency: "",
      duration_days: 30,
      is_active: true,
      sort_order: 0,
    },
  })

  useEffect(() => {
    if (!open) return
    if (editing) {
      reset({
        name: editing.name,
        slug: editing.slug,
        description: editing.description ?? "",
        price: editing.price,
        currency: editing.currency ?? "",
        duration_days: editing.duration_days,
        is_active: editing.is_active,
        sort_order: editing.sort_order ?? 0,
      })
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        price: 0,
        currency: "",
        duration_days: 30,
        is_active: true,
        sort_order: 0,
      })
    }
  }, [open, editing, reset])

  const isActive = useWatch({ control, name: "is_active" })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        description: values.description?.toString().trim() || null,
        price: values.price,
        currency: values.currency?.trim() ? values.currency.trim().toUpperCase() : null,
        duration_days: values.duration_days,
        is_active: values.is_active,
        sort_order: values.sort_order ?? 0,
      }
      if (editing) {
        const updated = await adminSubscriptionPlanService.update(
          editing.id,
          payload
        )
        toast.success(t("plans.form.successUpdate"))
        onSaved(updated, true)
      } else {
        const created = await adminSubscriptionPlanService.create(payload)
        toast.success(t("plans.form.successCreate"))
        onSaved(created, false)
      }
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fieldErrors = toFormErrors<SubscriptionPlanFormValues>(err.errors)
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (message)
            setError(field as keyof SubscriptionPlanFormValues, { message })
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
            {editing ? t("plans.editPlan") : t("plans.newPlan")}
          </DialogTitle>
          <DialogDescription>{t("plans.subtitle")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-name">{t("plans.form.nameLabel")}</Label>
              <Input
                id="plan-name"
                placeholder={t("plans.form.namePlaceholder")}
                {...register("name")}
              />
              {errors.name?.message && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-slug">{t("plans.form.slugLabel")}</Label>
              <Input
                id="plan-slug"
                placeholder={t("plans.form.slugPlaceholder")}
                {...register("slug")}
              />
              {errors.slug?.message && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-description">
              {t("plans.form.descriptionLabel")}
            </Label>
            <Textarea
              id="plan-description"
              placeholder={t("plans.form.descriptionPlaceholder")}
              {...register("description")}
            />
            {errors.description?.message && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-price">{t("plans.form.priceLabel")}</Label>
              <Input
                id="plan-price"
                type="number"
                step="0.01"
                placeholder={t("plans.form.pricePlaceholder")}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price?.message && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-currency">
                {t("plans.form.currencyLabel")}
              </Label>
              <Input
                id="plan-currency"
                placeholder={t("plans.form.currencyPlaceholder")}
                {...register("currency")}
              />
              {errors.currency?.message && (
                <p className="text-xs text-destructive">
                  {errors.currency.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-duration">
                {t("plans.form.durationLabel")}
              </Label>
              <Input
                id="plan-duration"
                type="number"
                min={1}
                placeholder={t("plans.form.durationPlaceholder")}
                {...register("duration_days", { valueAsNumber: true })}
              />
              {errors.duration_days?.message && (
                <p className="text-xs text-destructive">
                  {errors.duration_days.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-sort">
                {t("plans.form.sortOrderLabel")}
              </Label>
              <Input
                id="plan-sort"
                type="number"
                min={0}
                placeholder={t("plans.form.sortOrderPlaceholder")}
                {...register("sort_order", { valueAsNumber: true })}
              />
              {errors.sort_order?.message && (
                <p className="text-xs text-destructive">
                  {errors.sort_order.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">
                  {t("plans.form.isActiveLabel")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("plans.form.isActiveHint")}
                </p>
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
              {editing ? t("plans.form.save") : t("plans.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
