"use client"

import { useEffect, useState } from "react"
import { BookmarkPlus, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Switch } from "components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"

import { useSavedSearches } from "../hooks/useSavedSearches"
import {
  ALERT_FREQUENCIES,
  DEFAULT_ALERT_FREQUENCY,
  SAVED_SEARCH_NAME_MAX,
  type AlertFrequency,
  type SavedSearchFilters,
} from "../types"
import { SavedSearchServiceError } from "../services/savedSearchService"

export interface SaveSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: SavedSearchFilters
  defaultName?: string
  onSaved?: (id: number) => void
}

export function SaveSearchDialog({
  open,
  onOpenChange,
  filters,
  defaultName = "",
  onSaved,
}: SaveSearchDialogProps) {
  const t = useTranslations("savedSearches")
  const tCommon = useTranslations("common")
  const { create } = useSavedSearches()

  const [name, setName] = useState(defaultName)
  const [alertEnabled, setAlertEnabled] = useState(true)
  const [frequency, setFrequency] = useState<AlertFrequency>(DEFAULT_ALERT_FREQUENCY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      void Promise.resolve().then(() => {
        setName(defaultName)
        setAlertEnabled(true)
        setFrequency(DEFAULT_ALERT_FREQUENCY)
        setError(null)
      })
    }
  }, [open, defaultName])

  async function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError(t("nameRequired"))
      return
    }
    if (trimmed.length > SAVED_SEARCH_NAME_MAX) {
      setError(t("nameTooLong", { max: SAVED_SEARCH_NAME_MAX }))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const created = await create({
        name: trimmed,
        filters,
        alert_enabled: alertEnabled,
        alert_frequency: alertEnabled ? frequency : "never",
      })
      toast.success(t("saved"))
      onSaved?.(created.id)
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof SavedSearchServiceError
          ? err.message
          : err instanceof Error
            ? err.message
            : tCommon("error")
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="size-4" aria-hidden />
            {t("saveThisSearch")}
          </DialogTitle>
          <DialogDescription>{t("saveThisSearchDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="saved-search-name">{t("name")}</Label>
            <Input
              id="saved-search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              maxLength={SAVED_SEARCH_NAME_MAX}
              autoFocus
              disabled={submitting}
              data-testid="saved-search-name-input"
            />
            <p className="text-xs text-muted-foreground">
              {t("characterCount", { count: name.length, max: SAVED_SEARCH_NAME_MAX })}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="space-y-0.5">
              <Label htmlFor="saved-search-alerts" className="text-sm font-medium">
                {t("alerts")}
              </Label>
              <p className="text-xs text-muted-foreground">{t("alertsHelp")}</p>
            </div>
            <Switch
              id="saved-search-alerts"
              checked={alertEnabled}
              onCheckedChange={setAlertEnabled}
              disabled={submitting}
              data-testid="saved-search-alerts-switch"
            />
          </div>

          {alertEnabled && (
            <div className="space-y-2">
              <Label htmlFor="saved-search-frequency">{t("frequency")}</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as AlertFrequency)}
                disabled={submitting}
              >
                <SelectTrigger id="saved-search-frequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALERT_FREQUENCIES.filter((f) => f !== "never").map((f) => (
                    <SelectItem key={f} value={f}>
                      {t(`frequencyOptions.${f}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            data-testid="saved-search-submit"
          >
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t("saveSearch")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}