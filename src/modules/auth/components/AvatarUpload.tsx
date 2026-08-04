"use client"

import { useRef, useState } from "react"
import { Camera, Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { mediaService } from "src/modules/media"
import { ApiClientError } from "@/lib/apiClient"
import { useAbortController } from "@/lib/request"

const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

interface AvatarUploadProps {
  currentUrl: string | null | undefined
  alt?: string
  onUploaded: (avatarId: string) => void | Promise<void>
  onRemoved?: () => void | Promise<void>
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

const SIZE_CLASS: Record<NonNullable<AvatarUploadProps["size"]>, string> = {
  sm: "size-16",
  md: "size-24",
  lg: "size-32",
}

export function AvatarUpload({
  currentUrl,
  alt = "Avatar",
  onUploaded,
  onRemoved,
  size = "lg",
  disabled,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const controller = useAbortController()

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, or GIF files are supported")
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Avatar must be smaller than 5MB")
      return
    }

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)
    setProgress(0)

    try {
      const uploaded = await mediaService.uploadOne({
        type: "avatar",
        file,
        signal: controller.signal,
        onProgress: setProgress,
      })
      await onUploaded(String(uploaded.id))
      toast.success("Avatar updated")
    } catch (error) {
      if (controller.signal.aborted) return
      const message =
        error instanceof ApiClientError ? error.message : "Failed to upload avatar"
      toast.error(message)
    } finally {
      setUploading(false)
      setProgress(0)
      URL.revokeObjectURL(localUrl)
      setPreview(null)
    }
  }

  const display = preview ?? currentUrl ?? null
  const initial = (alt || "?").trim().charAt(0).toUpperCase() || "?"

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-full border bg-muted text-muted-foreground",
          SIZE_CLASS[size]
        )}
      >
        {display ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={display} alt={alt} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-2xl font-semibold">
            {initial}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-xs font-medium">
            <Loader2 className="size-4 animate-spin" />
            <span className="mt-1">{progress}%</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
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
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
            {currentUrl ? "Replace" : "Upload"}
          </Button>
          {currentUrl && onRemoved && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => onRemoved()}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Camera className="size-3" />
          JPG, PNG, WEBP, or GIF. Max 5MB.
        </p>
      </div>
    </div>
  )
}
