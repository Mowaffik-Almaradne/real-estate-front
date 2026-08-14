"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Textarea } from "components/ui/textarea"
import { Label } from "components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"

import { type ApiClientError } from "@/lib/apiClient"
import { useAdsTranslations } from "../locales/useAdsTranslations"
import {
  AD_GROUP_DESCRIPTION_MAX,
  AD_GROUP_NAME_MAX,
  AD_GROUP_STATUSES,
  type AdGroupDto,
  type AdGroupStatus,
  type CreateAdGroupRequest,
  type UpdateAdGroupRequest,
} from "../types"

interface AdGroupFormDialogProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  editing?: AdGroupDto | null
  onSubmit: (payload: CreateAdGroupRequest | UpdateAdGroupRequest) => Promise<unknown>
}

interface FormState {
  name: string
  description: string
  status: AdGroupStatus
}

function buildInitial(group?: AdGroupDto | null): FormState {
  return {
    name: group?.name ?? "",
    description: group?.description ?? "",
    status: (group?.status as AdGroupStatus) ?? AD_GROUP_STATUSES[0],
  }
}

export function AdGroupFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: AdGroupFormDialogProps) {
  const { t } = useAdsTranslations()
  const isEdit = Boolean(editing?.id)
  const [state, setState] = useState<FormState>(buildInitial(editing))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      Promise.resolve().then(() => {
        setState(buildInitial(editing))
        setErrors({})
      })
    }
  }, [open, editing])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!state.name.trim()) next.name = t("ads.groups.form.validation.nameRequired")
    else if (state.name.length > AD_GROUP_NAME_MAX)
      next.name = t("ads.groups.form.validation.nameTooLong")
    if (state.description.length > AD_GROUP_DESCRIPTION_MAX)
      next.description = t("ads.groups.form.validation.descriptionTooLong")
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        name: state.name.trim(),
        description: state.description.trim() || null,
        status: state.status,
      }
      await onSubmit(payload as CreateAdGroupRequest | UpdateAdGroupRequest)
      onOpenChange(false)
    } catch (err: unknown) {
      const apiError = err as ApiClientError
      if (apiError && typeof apiError === "object" && "errors" in apiError) {
        const mapped: Record<string, string> = {}
        for (const [key, value] of Object.entries(apiError.errors ?? {})) {
          if (Array.isArray(value) && value.length > 0) {
            mapped[key] = String(value[0])
          }
        }
        setErrors(mapped)
      } else if (err instanceof Error) {
        setErrors({ _form: err.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("ads.groups.editGroup") : t("ads.groups.newGroup")}
          </DialogTitle>
          <DialogDescription>{t("ads.groups.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="group-name">{t("ads.groups.form.nameLabel")}</Label>
            <Input
              id="group-name"
              value={state.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("ads.groups.form.namePlaceholder")}
              maxLength={AD_GROUP_NAME_MAX}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="group-description">
              {t("ads.groups.form.descriptionLabel")}
            </Label>
            <Textarea
              id="group-description"
              value={state.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("ads.groups.form.descriptionPlaceholder")}
              maxLength={AD_GROUP_DESCRIPTION_MAX}
              rows={3}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="group-status">
                {t("ads.groups.form.statusLabel")}
              </Label>
              <Select
                value={state.status}
                onValueChange={(next) => set("status", next as AdGroupStatus)}
              >
                <SelectTrigger id="group-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_GROUP_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "active"
                        ? t("ads.groups.form.statusActive")
                        : t("ads.groups.form.statusInactive")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {errors._form && (
            <p className="text-xs text-destructive">{errors._form}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit
              ? t("ads.groups.form.saveUpdate")
              : t("ads.groups.form.saveCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
