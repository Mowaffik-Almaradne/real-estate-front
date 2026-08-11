"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Building2, History, Loader2, MapPin, Search, X } from "lucide-react"

import { Input } from "components/ui/input"
import { cn } from "lib/utils"
import { useRecentSearches, useSearchSuggestions } from ".."
import type { SearchSuggestion } from "../types"

interface SearchAutocompleteProps {
  locale: string
  initialQuery?: string
  basePath?: string
  placeholder?: string
  onSubmit?: (query: string) => void
  className?: string
  inputClassName?: string
}

export function SearchAutocomplete({
  locale,
  initialQuery = "",
  basePath,
  placeholder,
  onSubmit,
  className,
  inputClassName,
}: SearchAutocompleteProps) {
  const t = useTranslations("search")
  const router = useRouter()
  const recent = useRecentSearches()
  const suggestions = useSearchSuggestions()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialQuery)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const targetBase = basePath ?? `/${locale}/properties`

  useEffect(() => {
    void Promise.resolve().then(() => {
      setValue(initialQuery)
    })
  }, [initialQuery])

  useEffect(() => {
    if (!open) {
      void Promise.resolve().then(() => setActiveIndex(-1))
    }
  }, [open])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const submitQuery = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    recent.add(trimmed)
    setOpen(false)
    suggestions.reset()
    if (onSubmit) {
      onSubmit(trimmed)
    } else {
      const url = `${targetBase}?search=${encodeURIComponent(trimmed)}`
      router.push(url)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((prev) => {
        const items = collectItems()
        return prev < items.length - 1 ? prev + 1 : prev
      })
      setOpen(true)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      const items = collectItems()
      const target = items[activeIndex]
      if (target && target.kind === "suggestion") {
        router.push(`/${locale}/properties/${target.item.id}`)
        setOpen(false)
        return
      }
      submitQuery(value)
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  const collectItems = (): Array<
    { kind: "recent"; query: string } | { kind: "suggestion"; item: SearchSuggestion }
  > => {
    const list: Array<
      { kind: "recent"; query: string } | { kind: "suggestion"; item: SearchSuggestion }
    > = []
    if (suggestions.query.trim().length === 0) {
      recent.items.forEach((r) => list.push({ kind: "recent", query: r.query }))
    } else {
      suggestions.suggestions.forEach((s) =>
        list.push({ kind: "suggestion", item: s })
      )
    }
    return list
  }

  const trimmed = value.trim()
  const showDropdown = open
  const showRecent =
    recent.isHydrated && trimmed.length === 0 && recent.items.length > 0
  const showSuggestions =
    trimmed.length > 0 && suggestions.suggestions.length > 0
  const showEmptyState =
    trimmed.length > 0 && !suggestions.loading && suggestions.suggestions.length === 0

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-autocomplete-listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
          }
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            suggestions.setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("placeholder")}
          className={cn("pl-9 pr-9", inputClassName)}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("")
              suggestions.reset()
              setOpen(true)
            }}
            aria-label={t("clear")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {showDropdown && (showRecent || showSuggestions || showEmptyState) && (
        <div
          id="search-autocomplete-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md"
        >
          {showRecent && (
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <History className="size-3" aria-hidden="true" />
                {t("recent")}
              </span>
              <button
                type="button"
                onClick={() => recent.clear()}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("clearRecent")}
              </button>
            </div>
          )}

          {showSuggestions && suggestions.loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              {t("loading")}
            </div>
          )}

          {showRecent &&
            recent.items.map((entry, idx) => (
              <button
                key={`${entry.query}-${idx}`}
                id={`search-option-${idx}`}
                role="option"
                aria-selected={activeIndex === idx}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => submitQuery(entry.query)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-muted",
                  activeIndex === idx && "bg-muted"
                )}
              >
                <History className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1 truncate">{entry.query}</span>
              </button>
            ))}

          {showSuggestions &&
            suggestions.suggestions.map((item, idx) => {
              const flatIndex = recent.items.length + idx
              return (
                <button
                  key={item.id}
                  id={`search-option-${flatIndex}`}
                  role="option"
                  aria-selected={activeIndex === flatIndex}
                  type="button"
                  onMouseEnter={() => setActiveIndex(flatIndex)}
                  onClick={() => {
                    router.push(`/${locale}/properties/${item.id}`)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-start text-sm hover:bg-muted",
                    activeIndex === flatIndex && "bg-muted"
                  )}
                >
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.mainImage ? (
                      <Image
                        src={item.mainImage}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Building2 className="size-4" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" aria-hidden="true" />
                      <span className="truncate">
                        {item.city}
                        {item.country ? `, ${item.country}` : ""}
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-foreground">
                    {item.formattedPrice}
                  </span>
                </button>
              )
            })}

          {showEmptyState && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              {t("noSuggestions")}
            </div>
          )}
        </div>
      )}
    </div>
  )
}