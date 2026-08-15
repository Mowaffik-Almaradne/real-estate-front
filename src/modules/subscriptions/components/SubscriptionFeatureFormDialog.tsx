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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"

import {
  subscriptionFeatureFormSchema,
  type SubscriptionFeatureFormValues,
} from "../schemas"
import { adminSubscriptionFeatureService } from "../services/subscriptionService"
import type { SubscriptionFeature } from "../types"
import { ApiClientError, toFormErrors } from "@/lib/apiClient"
import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

interface SubscriptionFeatureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: SubscriptionFeature | null
  onSaved: (feature: SubscriptionFeature, isUpdate: boolean) => void
}

export function SubscriptionFeatureFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: SubscriptionFeatureFormDialogProps) {
  const { t } = useSubscriptionsTranslations()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFeatureFormValues>({
    resolver: zodResolver(subscriptionFeatureFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      type: "toggle",
      description: "",
    },
  })

  useEffect(() => {
    if (!open) return
    if (editing) {
      reset({
        name: editing.name,
        slug: editing.slug,
        type: editing.type,
        description: editing.description ?? "",
      })
    } else {
      reset({
        name: "",
        slug: "",
        type: "toggle",
        description: "",
      })
    }
  }, [open, editing, reset])

  const currentType = useWatch({ control, name: "type" })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        type: values.type,
        description: values.description?.toString().trim() || null,
      }
      if (editing) {
        const updated = await adminSubscriptionFeatureService.update(
          editing.id,
          payload
        )
        toast.success(t("features.form.successUpdate"))
        onSaved(updated, true)
      } else {
        const created = await adminSubscriptionFeatureService.create(payload)
        toast.success(t("features.form.successCreate"))
        onSaved(created, false)
      }
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fieldErrors = toFormErrors<SubscriptionFeatureFormValues>(err.errors)
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (message)
            setError(field as keyof SubscriptionFeatureFormValues, { message })
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
            {editing ? t("features.editFeature") : t("features.newFeature")}
          </DialogTitle>
          <DialogDescription>{t("features.subtitle")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="feature-name">{t("features.form.nameLabel")}</Label>
              <Input
                id="feature-name"
                placeholder={t("features.form.namePlaceholder")}
                {...register("name")}
              />
              {errors.name?.message && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="feature-slug">{t("features.form.slugLabel")}</Label>
              <Input
                id="feature-slug"
                placeholder={t("features.form.slugPlaceholder")}
                {...register("slug")}
              />
              {errors.slug?.message && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("features.form.typeLabel")}</Label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                  currentType === "toggle"
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <input
                  type="radio"
                  value="toggle"
                  checked={currentType === "toggle"}
                  onChange={() =>
                    setValue("type", "toggle", { shouldDirty: true })
                  }
                  className="mt-1 size-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">
                    {t("features.form.typeToggle")}
                  </p>
                </div>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                  currentType === "limit"
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <input
                  type="radio"
                  value="limit"
                  checked={currentType === "limit"}
                  onChange={() =>
                    setValue("type", "limit", { shouldDirty: true })
                  }
                  className="mt-1 size-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">
                    {t("features.form.typeLimit")}
                  </p>
                </div>
              </label>
            </div>
            {errors.type?.message && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="feature-description">
              {t("features.form.descriptionLabel")}
            </Label>
            <Textarea
              id="feature-description"
              placeholder={t("features.form.descriptionPlaceholder")}
              {...register("description")}
            />
            {errors.description?.message && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
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
              {editing ? t("features.form.save") : t("features.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
