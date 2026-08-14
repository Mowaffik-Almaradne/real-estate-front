"use client"

import { useRef, useState } from "react"
import { Film, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ApiClientError } from "@/lib/apiClient"
import { mediaService } from "src/modules/media"
import { useAbortController } from "@/lib/request"

import { useAdsTranslations } from "../locales/useAdsTranslations"

const MAX_FILE_SIZE = 20 * 1024 * 1024

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
])

export interface AdMediaValue {
  id: number | string
  url?: string | null
  thumb_url?: string | null
  name?: string
  mime_type?: string | null
  size?: number
}

interface AdMediaUploadProps {
  value: AdMediaValue | null
  onChange: (next: AdMediaValue | null) => void
  disabled?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${bytes} B`
}

function isImageType(mime?: string | null): boolean {
  return Boolean(mime && IMAGE_TYPES.has(mime))
}

function isVideoType(mime?: string | null): boolean {
  return Boolean(mime && VIDEO_TYPES.has(mime))
}

export function AdMediaUpload({ value, onChange, disabled }: AdMediaUploadProps) {
  const { t } = useAdsTranslations()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const controller = useAbortController()

  const handleFile = async (file: File) => {
    if (disabled || uploading) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      return
    }
    if (value && !localPreview) {
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setLocalPreview(previewUrl)
    setUploading(true)
    setProgress(0)

    try {
      const uploaded = await mediaService.uploadOne({
        type: "property",
        file,
        signal: controller.signal,
        onProgress: setProgress,
      })

      onChange({
        id: uploaded.id,
        url: uploaded.url ?? null,
        thumb_url: uploaded.thumb_url ?? null,
        name: uploaded.filename ?? file.name,
        mime_type: uploaded.mime_type ?? file.type,
        size: uploaded.size ?? file.size,
      })
    } catch (error) {
      if (controller.signal.aborted) return
      const message =
        error instanceof ApiClientError ? error.message : "Upload failed"
      console.error(message)
    } finally {
      setUploading(false)
      setProgress(0)
      URL.revokeObjectURL(previewUrl)
      setLocalPreview(null)
    }
  }

  const handleRemove = () => {
    if (disabled || uploading) return
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const previewSrc = localPreview ?? value?.thumb_url ?? value?.url ?? null
  const showImagePreview = Boolean(value && isImageType(value.mime_type) && previewSrc)
  const showVideoBadge = Boolean(value && isVideoType(value.mime_type))

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-background">
            {showImagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc as string}
                alt={value.name ?? "Ad media"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                {showVideoBadge ? (
                  <Film className="size-7" />
                ) : (
                  <ImageIcon className="size-7" />
                )}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/80 text-xs font-medium">
                <Loader2 className="size-4 animate-spin" />
                <span>{progress}%</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {value.name ?? t("ads.form.mediaUploaded")}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {showVideoBadge
                ? t("ads.form.mediaTypeVideo")
                : t("ads.form.mediaTypeImage")}
              {value.size ? ` · ${formatBytes(value.size)}` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            disabled={disabled || uploading}
            aria-label={t("ads.form.mediaRemove")}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground",
            (disabled || uploading) && "opacity-60"
          )}
        >
          <div className="mx-auto mb-2 flex size-10 items-center justify-center text-muted-foreground">
            {uploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <Upload className="size-6" />
            )}
          </div>
          <p className="font-medium text-foreground">
            {uploading ? t("ads.form.mediaUploading") : t("ads.form.mediaEmpty")}
          </p>
          <p className="mt-1 text-xs">{t("ads.form.mediaHelp")}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
          event.target.value = ""
        }}
      />

      {!value && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
            {t("ads.form.addMedia")}
          </Button>
        </div>
      )}
    </div>
  )
}
