"use client"

import { useCallback, useState, useSyncExternalStore } from "react"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

const STORAGE_PREFIX = "property:saved-searches:"

function storageKey(locale: string): string {
  return `${STORAGE_PREFIX}${locale}`
}

export interface SavedSearch {
  id: string
  name: string
  url: string
  createdAt: number
}

export interface ActiveFilterChip {
  key: string
  label: string
  onRemove: () => void
}

interface SavedSearchesState {
  list: SavedSearch[]
  refresh: () => void
  remove: (id: string) => void
}

function readSaved(locale: string): SavedSearch[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(storageKey(locale))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSaved(locale: string, list: SavedSearch[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(storageKey(locale), JSON.stringify(list))
  } catch {
    void 0
  }
}

export function useSavedSearches(): SavedSearchesState {
  const locale = useLocale()
  const [bump, setBump] = useState(0)
  const list = useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {}
      const key = storageKey(locale)
      const handler = (e: StorageEvent) => {
        if (e.key === key || e.key === null) cb()
      }
      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    },
    () => {
      // bump is a dependency we read to subscribe to updates
      void bump
      return readSaved(locale)
    },
    () => [] as SavedSearch[]
  )

  const refresh = useCallback(() => setBump((b) => b + 1), [])

  const remove = useCallback(
    (id: string) => {
      const current = readSaved(locale)
      const next = current.filter((s) => s.id !== id)
      writeSaved(locale, next)
      setBump((b) => b + 1)
    },
    [locale]
  )

  return { list, refresh, remove }
}

export function saveCurrentSearch(locale: string, name: string, url: string): SavedSearch {
  const entry: SavedSearch = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    url,
    createdAt: Date.now(),
  }
  const current = readSaved(locale)
  const next = [entry, ...current].slice(0, 20)
  writeSaved(locale, next)
  return entry
}

export interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[]
  className?: string
  onClearAll?: () => void
  clearAllLabel?: string
}

export function ActiveFilterChips({
  chips,
  className,
  onClearAll,
  clearAllLabel,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 px-2 py-1 text-xs">
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label}`}
            className="ms-1 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-foreground/10"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {onClearAll && clearAllLabel && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 px-2 text-xs">
          {clearAllLabel}
        </Button>
      )}
    </div>
  )
}

export interface SaveSearchButtonProps {
  disabled?: boolean
  className?: string
}

export function SaveSearchButton({ disabled, className }: SaveSearchButtonProps) {
  const t = useTranslations("property.filters")
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const url = `${window.location.pathname}${window.location.search}`
    saveCurrentSearch(locale, trimmed, url)
    setName("")
    setOpen(false)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={className}
      >
        {t("saveSearch")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("saveSearch")}</DialogTitle>
            <DialogDescription>{t("searchSaved")}</DialogDescription>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apartments in Casablanca"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export interface ShareButtonProps {
  className?: string
}

export function ShareButton({ className }: ShareButtonProps) {
  const t = useTranslations("property.share")
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    const url = window.location.href
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const el = document.createElement("textarea")
        el.value = url
        document.body.appendChild(el)
        el.select()
        document.execCommand("copy")
        document.body.removeChild(el)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={className}
      aria-live="polite"
    >
      {copied ? t("copied") : t("button")}
    </Button>
  )
}

export interface SavedSearchesMenuProps {
  saved: SavedSearchesState
  className?: string
}

export function SavedSearchesMenu({ saved, className }: SavedSearchesMenuProps) {
  const t = useTranslations("property.filters")
  if (saved.list.length === 0) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        {t("noSavedSearches")}
      </p>
    )
  }
  return (
    <ul className={cn("space-y-1 text-sm", className)}>
      {saved.list.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
          <span className="truncate">{s.name}</span>
          <div className="flex items-center gap-1">
            <a
              href={s.url}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("loadSearch")}
            </a>
            <button
              type="button"
              onClick={() => saved.remove(s.id)}
              aria-label={t("deleteSearch")}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <X className="size-3" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
