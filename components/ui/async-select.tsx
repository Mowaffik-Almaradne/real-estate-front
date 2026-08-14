"use client"

import * as React from "react"
import { ChevronDown, Loader2, RefreshCw, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export interface AsyncSelectFetcherParams {
  search: string
  page: number
}

export interface AsyncSelectFetcherResult<T> {
  items: T[]
  hasMore: boolean
  total?: number
}

export type AsyncSelectFetcher<T> = (
  params: AsyncSelectFetcherParams,
) => Promise<AsyncSelectFetcherResult<T>>

export interface AsyncSelectProps<T> {
  value: T | null
  onChange: (next: T | null) => void
  fetcher: AsyncSelectFetcher<T>
  getOptionLabel: (option: T) => string
  getOptionValue: (option: T) => string | number
  placeholder: string
  searchPlaceholder?: string
  disabled?: boolean
  preload?: boolean
  pageSize?: number
  emptyMessage?: string
  errorMessage?: string
  className?: string
  id?: string
  "aria-label"?: string
  renderOption?: (option: T, active: boolean) => React.ReactNode
}

const DEBOUNCE_MS = 300

export function AsyncSelect<T>({
  value,
  onChange,
  fetcher,
  getOptionLabel,
  getOptionValue,
  placeholder,
  searchPlaceholder,
  disabled,
  preload = true,
  pageSize = 20,
  emptyMessage = "No results found.",
  errorMessage = "Failed to load options.",
  className,
  id,
  renderOption,
  ...rest
}: AsyncSelectProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [items, setItems] = React.useState<T[]>([])
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [initialLoading, setInitialLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(-1)

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const sentinelRef = React.useRef<HTMLLIElement | null>(null)
  const requestIdRef = React.useRef(0)

  const valueKey = value ? getOptionValue(value) : null
  const selectedLabel = value ? getOptionLabel(value) : ""
  const listboxId = React.useId()
  // pageSize is forwarded as a default to consumers via the fetcher closure; kept
  // here so the prop remains discoverable in TypeScript signatures.
  void pageSize

  const triggerLabel = rest["aria-label"] ?? placeholder

  const replaceItems = React.useCallback((incoming: T[]) => {
    setItems((prev) => {
      const seen = new Set<string | number>()
      const merged: T[] = []
      for (const option of prev) {
        const key = getOptionValue(option)
        if (seen.has(key)) continue
        seen.add(key)
        merged.push(option)
      }
      for (const option of incoming) {
        const key = getOptionValue(option)
        if (seen.has(key)) continue
        seen.add(key)
        merged.push(option)
      }
      return merged
    })
  }, [getOptionValue])

  const loadPage = React.useCallback(
    async (nextPage: number, nextSearch: string, mode: "replace" | "append") => {
      const requestId = ++requestIdRef.current
      if (mode === "replace") setInitialLoading(true)
      setLoading(true)
      setError(null)
      try {
        const result = await fetcher({ search: nextSearch, page: nextPage })
        if (requestId !== requestIdRef.current) return
        if (mode === "replace") {
          setItems(result.items)
          setActiveIndex(result.items.length > 0 ? 0 : -1)
        } else {
          replaceItems(result.items)
        }
        setHasMore(result.hasMore)
        setPage(nextPage)
      } catch {
        if (requestId !== requestIdRef.current) return
        setError(errorMessage)
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
          setInitialLoading(false)
        }
      }
    },
    [fetcher, replaceItems, errorMessage],
  )

  React.useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [search])

  React.useEffect(() => {
    if (!open) return
    if (!preload && debouncedSearch === "" && page === 1 && items.length === 0) return
    // Defer to a microtask so setInitialLoading/setLoading inside loadPage don't
    // happen synchronously inside this effect body.
    Promise.resolve().then(() => {
      void loadPage(1, debouncedSearch, "replace")
    })
  }, [debouncedSearch, open, preload, loadPage]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!open || !hasMore || loading) return
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting && hasMore && !loading) {
          void loadPage(page + 1, debouncedSearch, "append")
        }
      },
      { rootMargin: "120px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, hasMore, loading, page, debouncedSearch, loadPage])

  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      return
    }
    // Defer cleanup so we don't trigger synchronous setState inside this effect.
    Promise.resolve().then(() => {
      setSearch("")
      setActiveIndex(-1)
    })
  }, [open])

  const handleSelect = React.useCallback(
    (option: T) => {
      onChange(option)
      setOpen(false)
    },
    [onChange],
  )

  const handleClear = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onChange(null)
      setActiveIndex(-1)
    },
    [onChange],
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (!open) {
        if (
          event.key === "ArrowDown" ||
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault()
          setOpen(true)
        }
        return
      }
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActiveIndex((current) =>
          current < items.length - 1 ? current + 1 : current,
        )
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        setActiveIndex((current) => (current > 0 ? current - 1 : 0))
      } else if (event.key === "Enter") {
        event.preventDefault()
        const option = items[activeIndex]
        if (option) handleSelect(option)
      } else if (event.key === "Tab") {
        setOpen(false)
      }
    },
    [activeIndex, handleSelect, items, open],
  )

  const handleRetry = React.useCallback(() => {
    void loadPage(1, debouncedSearch, "replace")
  }, [loadPage, debouncedSearch])

  const showSkeleton = (initialLoading && items.length === 0) || (loading && items.length === 0)

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-label={triggerLabel}
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          setOpen((current) => !current)
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-ring ring-offset-2",
        )}
      >
        <span className={cn("flex-1 truncate text-start", !value && "text-muted-foreground")}>
          {value ? selectedLabel : placeholder}
        </span>
        <span className="flex items-center gap-1">
          {value !== null && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={handleClear}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              data-testid="async-select-clear"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
          data-testid="async-select-dropdown"
        >
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder ?? `Search ${placeholder.toLowerCase()}...`}
                aria-controls={listboxId}
                aria-autocomplete="list"
                className="h-8 w-full rounded-md border border-border bg-background ps-8 pe-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-busy={loading}
            className="max-h-64 overflow-y-auto py-1"
          >
            {showSkeleton && (
              <>
                {Array.from({ length: 4 }).map((_, index) => (
                  <li key={`skeleton-${index}`} className="px-2 py-1.5" aria-hidden="true">
                    <Skeleton className="h-5 w-full" />
                  </li>
                ))}
              </>
            )}

            {!showSkeleton && error && (
              <li className="px-3 py-4 text-sm">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-destructive">{error}</span>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-accent"
                  >
                    <RefreshCw className="size-3" />
                    Retry
                  </button>
                </div>
              </li>
            )}

            {!showSkeleton && !error && items.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </li>
            )}

            {!showSkeleton &&
              !error &&
              items.map((option, index) => {
                const optionKey = getOptionValue(option)
                const isActive = index === activeIndex
                const isSelected = valueKey !== null && optionKey === valueKey
                return (
                  <li
                    key={`${optionKey}-${index}`}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-start text-sm transition-colors hover:bg-accent focus:bg-accent focus:outline-none",
                        isActive && "bg-accent",
                        isSelected && "font-medium",
                      )}
                    >
                      {renderOption
                        ? renderOption(option, isActive)
                        : (
                            <span className="truncate">{getOptionLabel(option)}</span>
                          )}
                      {isSelected && (
                        <span className="text-xs text-primary">Selected</span>
                      )}
                    </button>
                  </li>
                )
              })}

            {loading && items.length > 0 && (
              <li className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
              </li>
            )}

            <li
              ref={sentinelRef}
              aria-hidden="true"
              className="h-1 w-full"
            />
          </ul>
        </div>
      )}
    </div>
  )
}

export default AsyncSelect
