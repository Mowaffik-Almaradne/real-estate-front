"use client"

import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", placeholder: "https://facebook.com/your-page" },
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/your-handle" },
  { id: "twitter", label: "X (Twitter)", placeholder: "https://x.com/your-handle" },
  { id: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/your-handle" },
  { id: "youtube", label: "YouTube", placeholder: "https://youtube.com/@your-channel" },
  { id: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@your-handle" },
  { id: "website", label: "Website", placeholder: "https://your-site.com" },
] as const

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number]["id"]

export type SocialLinksMap = Partial<Record<SocialPlatformId, string>> & Record<string, string>

interface SocialLinksEditorProps {
  value: SocialLinksMap
  onChange: (next: SocialLinksMap) => void
  disabled?: boolean
}

function normalizeUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function SocialLinksEditor({ value, onChange, disabled }: SocialLinksEditorProps) {
  const entries = Object.entries(value).filter(([, url]) => url && url.trim().length > 0)

  const addEntry = () => {
    const used = new Set(entries.map(([key]) => key))
    const next = SOCIAL_PLATFORMS.find((platform) => !used.has(platform.id))
    if (!next) return
    onChange({ ...value, [next.id]: "" })
  }

  const updateEntry = (currentKey: string, nextKey: string, nextValue: string) => {
    const normalized = normalizeUrl(nextValue) ?? ""
    const next: SocialLinksMap = {}
    for (const [key, val] of Object.entries(value)) {
      if (key === currentKey) {
        if (normalized) next[nextKey] = normalized
      } else {
        next[key] = val
      }
    }
    onChange(next)
  }

  const removeEntry = (key: string) => {
    const next: SocialLinksMap = {}
    for (const [k, v] of Object.entries(value)) {
      if (k !== key) next[k] = v
    }
    onChange(next)
  }

  const availablePlatformsFor = (currentKey: string): typeof SOCIAL_PLATFORMS[number][] => {
    const used = new Set(entries.map(([k]) => k))
    return SOCIAL_PLATFORMS.filter((p) => p.id === currentKey || !used.has(p.id))
  }

  return (
    <div className="space-y-3">
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No social links added yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([key, url]) => {
            const current = SOCIAL_PLATFORMS.find((p) => p.id === key) ?? {
              id: key,
              label: key,
              placeholder: "https://...",
            }
            return (
              <div key={key} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="sm:w-40">
                  <Select
                    value={current.id}
                    disabled={disabled}
                    onValueChange={(value) =>
                      updateEntry(key, value as SocialPlatformId, url)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlatformsFor(key).map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="sr-only" htmlFor={`social-${key}`}>
                    URL
                  </Label>
                  <Input
                    id={`social-${key}`}
                    type="url"
                    placeholder={current.placeholder}
                    value={url}
                    disabled={disabled}
                    onChange={(event) => updateEntry(key, key, event.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => removeEntry(key)}
                  aria-label={`Remove ${current.label}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || entries.length >= SOCIAL_PLATFORMS.length}
        onClick={addEntry}
      >
        <Plus className="size-4" />
        Add social link
      </Button>
    </div>
  )
}
