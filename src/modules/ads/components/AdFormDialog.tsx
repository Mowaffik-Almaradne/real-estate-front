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

import { AdMediaType, AdStatus } from "@/types/enums"
import { type ApiClientError } from "@/lib/apiClient"
import { useAdsTranslations } from "../locales/useAdsTranslations"
import {
  AD_DESCRIPTION_MAX,
  AD_EXTERNAL_URL_MAX,
  AD_TITLE_MAX,
  type AdDto,
  type AdGroupDto,
  type CreateAdRequest,
  type UpdateAdRequest,
} from "../types"

interface AdFormDialogProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  editing?: AdDto | null
  groups: AdGroupDto[]
  defaultGroupId?: number | null
  onSubmit: (payload: CreateAdRequest | UpdateAdRequest) => Promise<unknown>
}

interface FormState {
  title: string
  description: string
  media_type: AdMediaType
  status: AdStatus
  ad_group_id: string
  external_url: string
  start_date: string
  end_date: string
}

const NONE_GROUP_VALUE = "__none__"

function toDateTimeLocal(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromDateTimeLocal(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function buildInitial(ad?: AdDto | null): FormState {
  return {
    title: ad?.title ?? "",
    description: ad?.description ?? "",
    media_type: (ad?.media_type as AdMediaType) ?? AdMediaType.image,
    status: (ad?.status as AdStatus) ?? AdStatus.draft,
    ad_group_id: ad?.ad_group_id != null ? String(ad.ad_group_id) : "",
    external_url: ad?.external_url ?? "",
    start_date: toDateTimeLocal(ad?.start_date),
    end_date: toDateTimeLocal(ad?.end_date),
  }
}

export function AdFormDialog({
  open,
  onOpenChange,
  editing,
  groups,
  defaultGroupId,
  onSubmit,
}: AdFormDialogProps) {
  const { t } = useAdsTranslations()
  const isEdit = Boolean(editing?.id)
  const [state, setState] = useState<FormState>(buildInitial(editing))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      const next = buildInitial(editing)
      if (!isEdit && defaultGroupId != null) {
        next.ad_group_id = String(defaultGroupId)
      }
      setState(next)
      setErrors({})
    }
  }, [open, editing, defaultGroupId, isEdit])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!state.title.trim()) next.title = t("ads.form.validation.titleRequired")
    else if (state.title.length > AD_TITLE_MAX)
      next.title = t("ads.form.validation.titleTooLong")
    if (state.description.length > AD_DESCRIPTION_MAX)
      next.description = t("ads.form.validation.descriptionTooLong")
    if (!state.media_type) next.media_type = t("ads.form.validation.mediaTypeRequired")
    if (state.external_url) {
      try {
        const url = new URL(state.external_url)
        if (url.toString().length > AD_EXTERNAL_URL_MAX) {
          next.external_url = t("ads.form.validation.invalidUrl")
        }
      } catch {
        next.external_url = t("ads.form.validation.invalidUrl")
      }
    }
    if (state.start_date && state.end_date) {
      const start = new Date(state.start_date).getTime()
      const end = new Date(state.end_date).getTime()
      if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
        next.end_date = t("ads.form.validation.endBeforeStart")
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        title: state.title.trim(),
        description: state.description.trim() || null,
        media_type: state.media_type,
        status: state.status,
        external_url: state.external_url.trim() || null,
        start_date: fromDateTimeLocal(state.start_date),
        end_date: fromDateTimeLocal(state.end_date),
      }
      if (state.ad_group_id === NONE_GROUP_VALUE || state.ad_group_id === "") {
        payload.ad_group_id = null
      } else {
        payload.ad_group_id = Number(state.ad_group_id)
      }
      await onSubmit(payload as CreateAdRequest | UpdateAdRequest)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("ads.editAd") : t("ads.newAd")}
          </DialogTitle>
          <DialogDescription>
            {t("ads.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ad-title">{t("ads.form.titleLabel")}</Label>
            <Input
              id="ad-title"
              value={state.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={t("ads.form.titlePlaceholder")}
              maxLength={AD_TITLE_MAX}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ad-description">{t("ads.form.descriptionLabel")}</Label>
            <Textarea
              id="ad-description"
              value={state.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("ads.form.descriptionPlaceholder")}
              maxLength={AD_DESCRIPTION_MAX}
              rows={4}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ad-media-type">{t("ads.form.mediaTypeLabel")}</Label>
              <Select
                value={state.media_type}
                onValueChange={(next) => set("media_type", next as AdMediaType)}
              >
                <SelectTrigger id="ad-media-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AdMediaType.image}>
                    {t("ads.form.mediaTypeImage")}
                  </SelectItem>
                  <SelectItem value={AdMediaType.video}>
                    {t("ads.form.mediaTypeVideo")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ad-status">{t("ads.form.statusLabel")}</Label>
              <Select
                value={state.status}
                onValueChange={(next) => set("status", next as AdStatus)}
              >
                <SelectTrigger id="ad-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AdStatus.draft}>
                    {t("ads.status.draft")}
                  </SelectItem>
                  <SelectItem value={AdStatus.active}>
                    {t("ads.status.active")}
                  </SelectItem>
                  <SelectItem value={AdStatus.paused}>
                    {t("ads.status.paused")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ad-group">{t("ads.form.groupLabel")}</Label>
            <Select
              value={state.ad_group_id || NONE_GROUP_VALUE}
              onValueChange={(next) => set("ad_group_id", next)}
            >
              <SelectTrigger id="ad-group">
                <SelectValue placeholder={t("ads.form.groupPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_GROUP_VALUE}>
                  {t("ads.form.groupNone")}
                </SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ad-external-url">{t("ads.form.externalUrlLabel")}</Label>
            <Input
              id="ad-external-url"
              value={state.external_url}
              onChange={(e) => set("external_url", e.target.value)}
              placeholder={t("ads.form.externalUrlPlaceholder")}
              type="url"
              maxLength={AD_EXTERNAL_URL_MAX}
              aria-invalid={Boolean(errors.external_url)}
            />
            {errors.external_url && (
              <p className="text-xs text-destructive">{errors.external_url}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ad-start-date">{t("ads.form.startDateLabel")}</Label>
              <Input
                id="ad-start-date"
                type="datetime-local"
                value={state.start_date}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ad-end-date">{t("ads.form.endDateLabel")}</Label>
              <Input
                id="ad-end-date"
                type="datetime-local"
                value={state.end_date}
                onChange={(e) => set("end_date", e.target.value)}
                aria-invalid={Boolean(errors.end_date)}
              />
              {errors.end_date && (
                <p className="text-xs text-destructive">{errors.end_date}</p>
              )}
            </div>
          </div>

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
            {isEdit ? t("ads.form.saveUpdate") : t("ads.form.saveCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
