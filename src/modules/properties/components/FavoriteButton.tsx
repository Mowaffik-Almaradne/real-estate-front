"use client"

import { useCallback, useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { propertyService } from "src/modules/properties/services/propertyService"
import { ApiClientError } from "@/lib/apiClient"
import { useFavorites } from "src/modules/favorites/FavoritesProvider"

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
  const favorites = useFavorites()
  const isFavorited = favorites.isFavorite(propertyId) || initial
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  const toggle = useCallback(
    async (event?: React.MouseEvent) => {
      event?.stopPropagation()
      event?.preventDefault()
      if (busy) return

      const previous = isFavorited
      const next = !previous
      if (next) favorites.add(propertyId)
      else favorites.remove(propertyId)

      setBusy(true)
      try {
        const result = await propertyService.toggleFavorite(propertyId, previous)
        if (typeof result.favorites_count === "number") {
          setCount(result.favorites_count)
        }
        if (result.favorited) favorites.add(propertyId)
        else favorites.remove(propertyId)
        onChange?.(result.favorited, result.favorites_count)
      } catch (error) {
        // Local state already updated; only roll back on unexpected failures.
        if (previous) favorites.add(propertyId)
        else favorites.remove(propertyId)
        const message =
          error instanceof ApiClientError ? error.message : "Could not update favorite"
        toast.error(message)
      } finally {
        setBusy(false)
      }
    },
    [busy, favorites, isFavorited, onChange, propertyId]
  )

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant={isFavorited ? "default" : "outline"}
        size="sm"
        onClick={(e) => void toggle(e)}
        disabled={busy}
        className={cn("gap-1.5", className)}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Heart className={cn("size-4", isFavorited && "fill-current")} />
        )}
        {isFavorited ? "Saved" : "Save"}
        {typeof count === "number" && (
          <span className="text-xs text-muted-foreground">({count})</span>
        )}
      </Button>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => void toggle(e)}
      disabled={busy}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorited}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
        isFavorited
          ? "bg-red-500/80 text-white"
          : "bg-white/20 text-white hover:bg-white/40",
        busy && "opacity-60",
        className
      )}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={cn("size-4 transition-transform", isFavorited && "fill-current")} />
      )}
    </button>
  )
}
