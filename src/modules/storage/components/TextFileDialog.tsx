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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  FILE_NAME_MAX,
  TEXT_FILE_CONTENT_MAX,
  type File,
} from "../types"
import { useStorageTranslations } from "../locales/useStorageTranslations"
import {
  createTextFileSchema,
  updateTextFileSchema,
  type CreateTextFileValues,
  type UpdateTextFileValues,
} from "../schemas"

interface TextFileDialogProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  editing?: File | null
  onSubmit: (
    payload: CreateTextFileValues | UpdateTextFileValues
  ) => Promise<unknown>
}

export function TextFileDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: TextFileDialogProps) {
  const { t } = useStorageTranslations()
  const isEdit = Boolean(editing?.id)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    queueMicrotask(() => {
      setName(editing?.name ?? "")
      setContent(editing?.content ?? "")
      setErrors({})
    })
  }, [open, editing])

  const handleSubmit = async () => {
    const next: Record<string, string> = {}
    if (!name.trim()) {
      next.name = t("fileDialog.validation.nameRequired")
    } else if (name.length > FILE_NAME_MAX) {
      next.name = t("fileDialog.validation.nameTooLong")
    }
    if (content.length > TEXT_FILE_CONTENT_MAX) {
      next.content = t("fileDialog.validation.contentTooLong")
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const payload = isEdit
        ? { name: name.trim(), content }
        : { name: name.trim(), content }
      await onSubmit(payload as CreateTextFileValues | UpdateTextFileValues)
      onOpenChange(false)
    } catch (err: unknown) {
      const apiError = err as {
        errors?: Record<string, string[]>
        message?: string
      }
      if (apiError && typeof apiError === "object" && apiError.errors) {
        const mapped: Record<string, string> = {}
        for (const [key, value] of Object.entries(apiError.errors)) {
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
          <DialogTitle>{t("fileDialog.title")}</DialogTitle>
          <DialogDescription>{t("fileDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="text-file-name">{t("fileDialog.nameLabel")}</Label>
            <Input
              id="text-file-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("fileDialog.namePlaceholder")}
              maxLength={FILE_NAME_MAX}
              aria-invalid={Boolean(errors.name)}
              data-testid="text-file-name-input"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="text-file-content">
              {t("fileDialog.contentLabel")}
            </Label>
            <Textarea
              id="text-file-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("fileDialog.contentPlaceholder")}
              rows={6}
              maxLength={TEXT_FILE_CONTENT_MAX}
              aria-invalid={Boolean(errors.content)}
              data-testid="text-file-content-input"
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content}</p>
            )}
          </div>
          {errors._form && (
            <p className="text-xs text-destructive">{errors._form}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="text-file-submit"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? t("fileDialog.saveUpdate") : t("fileDialog.saveCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { createTextFileSchema, updateTextFileSchema }
