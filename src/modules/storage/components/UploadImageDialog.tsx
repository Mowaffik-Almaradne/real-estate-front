"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { useStorageTranslations } from "../locales/useStorageTranslations"

interface UploadImageDialogProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  remainingBytes: number | null
  onSubmit: (file: globalThis.File) => Promise<unknown>
}

export function UploadImageDialog({
  open,
  onOpenChange,
  remainingBytes,
  onSubmit,
}: UploadImageDialogProps) {
  const { t } = useStorageTranslations()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!file) {
      setError(t("fileDialog.validation.nameRequired"))
      return
    }
    if (remainingBytes != null && file.size > remainingBytes) {
      setError(t("storage.exceeded"))
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(file)
      onOpenChange(false)
      setFile(null)
      setError(null)
      if (inputRef.current) inputRef.current.value = ""
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorLoading"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("actions.uploadImage")}</DialogTitle>
          <DialogDescription>{t("fileDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Label htmlFor="upload-file-input">Image</Label>
          <input
            ref={inputRef}
            id="upload-file-input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null
              setFile(next)
              setError(null)
            }}
            data-testid="image-upload-input"
          />
          {file && (
            <p className="text-xs text-muted-foreground">
              {file.name} · {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
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
            disabled={submitting || !file}
            data-testid="image-upload-submit"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 h-4 w-4" />
            )}
            {t("fileDialog.upload")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
