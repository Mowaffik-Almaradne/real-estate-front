"use client"

import { useCallback, useEffect, useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { propertyService } from "src/modules/properties/services/propertyService"
import { ApiClientError } from "@/lib/apiClient"

interface FavoriteButtonProps {
  propertyId: number
  initial?: boolean
  initialCount?: number
  variant?: "icon" | "full"
  onChange?: (favorited: boolean, count: number) => void
  className?: string
}

export function FavoriteButton({
  propertyId,
  initial = false,
  initialCount,
  variant = "icon",
  onChange,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initial)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setFavorited(initial)
  }, [initial])

  const toggle = useCallback(async () => {
    if (busy) return
    const previous = favorited
    const previousCount = count
    setFavorited(!previous)
    if (typeof previousCount === "number") {
      setCount(previous ? previousCount - 1 : previousCount + 1)
    }
    setBusy(true)
    try {
      const result = await propertyService.toggleFavorite(propertyId)
      setFavorited(result.favorited)
      if (typeof result.favorites_count === "number") {
        setCount(result.favorites_count)
      }
      onChange?.(result.favorited, result.favorites_count)
    } catch (error) {
      setFavorited(previous)
      if (typeof previousCount === "number") {
        setCount(previousCount)
      }
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Could not update favorite"
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }, [busy, count, favorited, onChange, propertyId])

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant={favorited ? "default" : "outline"}
        size="sm"
        onClick={toggle}
        disabled={busy}
        className={cn("gap-1.5", className)}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Heart className={cn("size-4", favorited && "fill-current")} />}
        {favorited ? "Saved" : "Save"}
        {typeof count === "number" && <span className="text-xs text-muted-foreground">({count})</span>}
      </Button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorited}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
        favorited
          ? "bg-red-500/80 text-white"
          : "bg-white/20 text-white hover:bg-white/40",
        busy && "opacity-60",
        className
      )}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={cn("size-4 transition-transform", favorited && "fill-current")} />
      )}
    </button>
  )
}
