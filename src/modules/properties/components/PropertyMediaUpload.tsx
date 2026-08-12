"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, Star, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { mediaService } from "src/modules/media"
import { ApiClientError } from "@/lib/apiClient"
import { useAbortController } from "@/lib/request"

const MAX_FILE_SIZE = 25 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

export interface MediaItem {
  id: string
  url: string
  thumb_url?: string
  uploading?: boolean
  progress?: number
}

interface PropertyMediaUploadProps {
  value: MediaItem[]
  onChange: (next: MediaItem[]) => void
  maxFiles?: number
  disabled?: boolean
  mainIndex?: number
  onMainChange?: (index: number) => void
}

export function PropertyMediaUpload({
  value,
  onChange,
  maxFiles = 12,
  disabled,
  mainIndex = 0,
  onMainChange,
}: PropertyMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploadingCount, setUploadingCount] = useState(0)
  const controller = useAbortController()

  useEffect(() => {
    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setItems = (updater: (current: MediaItem[]) => MediaItem[]) => {
    onChange(updater(value))
  }

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image type`)
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 25MB`)
        return false
      }
      return true
    })

    if (list.length === 0) return
    if (value.length + list.length > maxFiles) {
      toast.error(`You can upload at most ${maxFiles} files`)
      return
    }

    const placeholders: MediaItem[] = list.map((file) => ({
      id: `local-${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(file),
      uploading: true,
      progress: 0,
    }))

    setItems((current) => [...current, ...placeholders])
    setUploadingCount((count) => count + list.length)

    try {
      const uploaded = await mediaService.uploadMany({
        type: "property",
        files: list,
        signal: controller.signal,
        onProgress: (percent) => {
          setItems((current) =>
            current.map((item) =>
              placeholders.find((placeholder) => placeholder.id === item.id)
                ? { ...item, progress: percent }
                : item
            )
          )
        },
      })

      const idMap = new Map<string, string>()
      for (let i = 0; i < list.length; i += 1) {
        const replacement = uploaded[i]
        const newId = replacement ? String(replacement.id) : placeholders[i].id
        idMap.set(placeholders[i].id, newId)
      }

      setItems((current) =>
        current
          .map((item) => {
            const replacementId = idMap.get(item.id)
            if (!replacementId || replacementId === item.id) return item
            const replacement = uploaded.find(
              (file) => String(file.id) === replacementId
            )
            return replacement
              ? {
                  id: String(replacement.id),
                  url: replacement.url ?? item.url,
                  thumb_url: replacement.thumb_url,
                }
              : item
          })
          .filter((item) => !item.id.startsWith("local-"))
      )
      toast.success(`${list.length} image${list.length === 1 ? "" : "s"} uploaded`)
    } catch (error) {
      setItems((current) =>
        current.filter((item) => !placeholders.find((p) => p.id === item.id))
      )
      if (controller.signal.aborted) return
      const message =
        error instanceof ApiClientError ? error.message : "Failed to upload images"
      toast.error(message)
    } finally {
      setUploadingCount((count) => Math.max(0, count - list.length))
    }
  }

  const removeAt = (index: number) => {
    const next = value.filter((_, i) => i !== index)
    onChange(next)
    if (onMainChange) {
      if (next.length === 0) onMainChange(0)
      else if (index === mainIndex) onMainChange(0)
      else if (index < mainIndex) onMainChange(mainIndex - 1)
    }
  }

  const setMain = (index: number) => {
    if (index === mainIndex) return
    onMainChange?.(index)
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const next = [...value]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
    if (onMainChange) {
      if (mainIndex === index) onMainChange(target)
      else if (mainIndex === target) onMainChange(index)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Gallery ({value.length}/{maxFiles})
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploadingCount > 0 || value.length >= maxFiles}
          onClick={() => inputRef.current?.click()}
        >
          {uploadingCount > 0 ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload images
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          multiple
          disabled={disabled || uploadingCount > 0}
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              void handleFiles(event.target.files)
            }
            event.target.value = ""
          }}
        />
      </div>

      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <ImageIcon className="size-8 mx-auto mb-2 opacity-60" />
          <p>No images uploaded yet.</p>
          <p className="text-xs">JPG, PNG, WEBP, GIF, or AVIF. Max 25MB each.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((item, index) => {
            const isMain = index === mainIndex
            return (
              <div
                key={item.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-muted",
                  isMain && "ring-2 ring-primary"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumb_url ?? item.url}
                  alt={`Property image ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
                {item.uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/80 text-xs font-medium">
                    <Loader2 className="size-4 animate-spin" />
                    <span>{item.progress ?? 0}%</span>
                  </div>
                )}
                <div className="absolute top-1 left-1 flex items-center gap-1">
                  {onMainChange && (
                    <button
                      type="button"
                      title={isMain ? "Main image" : "Set as main image"}
                      onClick={() => setMain(index)}
                      className={cn(
                        "rounded-full p-1.5 backdrop-blur-md transition",
                        isMain
                          ? "bg-primary text-primary-foreground"
                          : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Star className={cn("size-3.5", isMain && "fill-current")} />
                    </button>
                  )}
                </div>
                <div className="absolute top-1 right-1 flex items-center gap-1">
                  <button
                    type="button"
                    title="Move left"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-full bg-black/40 p-1.5 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100 disabled:opacity-30"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move right"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    className="rounded-full bg-black/40 p-1.5 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100 disabled:opacity-30"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => removeAt(index)}
                    className="rounded-full bg-destructive/80 p-1.5 text-destructive-foreground opacity-0 transition hover:bg-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                {isMain && (
                  <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Main
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {uploadingCount > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Uploading {uploadingCount} image{uploadingCount === 1 ? "" : "s"}...
        </p>
      )}
    </div>
  )
}

export function buildMainImageField(items: MediaItem[], mainIndex: number) {
  const main = items[mainIndex] ?? items[0]
  if (!main) return undefined
  const numericId = Number(main.id)
  return { id: Number.isFinite(numericId) ? numericId : undefined, temporary_folder: main.id }
}

export function buildGalleryField(items: MediaItem[]) {
  return items.map((item) => {
    const numericId = Number(item.id)
    return { id: Number.isFinite(numericId) ? numericId : undefined, temporary_folder: item.id }
  })
}

export function previewUrl(file: File): string {
  return URL.createObjectURL(file)
}

export function revokePreview(url: string) {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url)
}
