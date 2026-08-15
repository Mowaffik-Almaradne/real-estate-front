"use client"

import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { leadService } from "../services/crmService"
import { createLeadSchema, type CreateLeadValues } from "../schemas"
import { LEAD_SOURCES, LEAD_STATUSES } from "../types"
import { ApiClientError, toFormErrors } from "@/lib/apiClient"
import type { Lead, LeadSource, LeadStatus } from "../types"

interface LeadFormProps {
  onSuccess?: (lead: Lead) => void
  onCancel?: () => void
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  referral: "Referral",
  walk_in: "Walk-in",
  phone: "Phone",
  other: "Other",
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
}

export function LeadForm({ onSuccess, onCancel }: LeadFormProps) {
  const t = useTranslations()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      source: "website",
      status: "new",
    },
  })

  const source = useWatch({ control, name: "source" })
  const status = useWatch({ control, name: "status" })
  const phone = useWatch({ control, name: "phone" })
  const email = useWatch({ control, name: "email" })

  useEffect(() => {
    let cancelled = false
    const handle = window.setTimeout(() => {
      if (cancelled) return
      if (!phone && !email) return
      void leadService
        .checkDuplicate({
          phone: phone || undefined,
          email: email || undefined,
        })
        .then((result) => {
          if (cancelled) return
          if (result.duplicate && result.match) {
            toast.warning(
              `${t("crm.duplicate.warning") || "Possible duplicate"}: ${result.match.name}`,
              {
                description:
                  t("crm.duplicate.matchedOn", {
                    field: result.match.matched_on,
                  }) || `Matched on ${result.match.matched_on}`,
              }
            )
          }
        })
        .catch(() => {
          /* ignore — duplicate check is advisory */
        })
    }, 500)
    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [phone, email, t])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const lead = await leadService.create({
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        source: values.source,
        status: values.status,
      })
      toast.success(t("crm.toast.created") || "Lead created")
      onSuccess?.(lead)
    } catch (err) {
      if (err instanceof ApiClientError && err.isValidation()) {
        const fieldErrors = toFormErrors<CreateLeadValues>(err.errors)
        for (const [key, message] of Object.entries(fieldErrors)) {
          if (message) {
            setError(key as keyof CreateLeadValues, { message })
          }
        }
        return
      }
      const message = err instanceof Error ? err.message : "Failed to create lead"
      toast.error(message)
    }
  })

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
      data-testid="crm-lead-form"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="lead-name">{t("crm.fields.name") || "Name"} *</Label>
        <Input id="lead-name" autoFocus {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lead-phone">{t("crm.fields.phone") || "Phone"} *</Label>
          <Input id="lead-phone" inputMode="tel" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-email">{t("crm.fields.email") || "Email"}</Label>
          <Input id="lead-email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("crm.fields.source") || "Source"} *</Label>
          <Select
            value={source}
            onValueChange={(value) =>
              setValue("source", value as LeadSource, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCES.map((option) => (
                <SelectItem key={option} value={option}>
                  {SOURCE_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.source && <p className="text-xs text-destructive">{errors.source.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>{t("crm.fields.status") || "Status"}</Label>
          <Select
            value={status ?? "new"}
            onValueChange={(value) =>
              setValue("status", value as LeadStatus, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {STATUS_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel") || "Cancel"}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} data-testid="crm-submit-lead">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {t("crm.actions.create") || "Create lead"}
        </Button>
      </div>
    </form>
  )
}
