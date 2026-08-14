"use client"

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "components/ui/button"
import { cn } from "@/lib/utils"

/** Default page size for dashboard lists (API docs example uses 15). */
export const DEFAULT_PAGE_SIZE = 15

export interface PaginationProps {
  currentPage: number
  totalPages?: number
  total?: number
  perPage?: number
  onPageChange: (page: number) => void
  siblingCount?: number
  disabled?: boolean
  className?: string
}

function resolveTotalPages(
  totalPages: number | undefined,
  total: number | undefined,
  perPage: number | undefined
): number {
  if (typeof totalPages === "number" && totalPages > 0) {
    return Math.max(1, Math.floor(totalPages))
  }
  if (typeof total === "number" && typeof perPage === "number" && perPage > 0) {
    return Math.max(1, Math.ceil(total / perPage))
  }
  return 1
}

function getPageItems(
  current: number,
  last: number,
  siblingCount: number
): Array<number | "ellipsis"> {
  if (last <= 1) return [1]

  const items: Array<number | "ellipsis"> = [1]
  const start = Math.max(2, current - siblingCount)
  const end = Math.min(last - 1, current + siblingCount)

  if (start > 2) items.push("ellipsis")
  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }
  if (end < last - 1) items.push("ellipsis")
  if (last > 1) items.push(last)

  return items
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  perPage,
  onPageChange,
  siblingCount = 1,
  disabled = false,
  className,
}: PaginationProps) {
  const lastPage = resolveTotalPages(totalPages, total, perPage)
  const page = Math.min(Math.max(1, currentPage || 1), lastPage)
  const items = getPageItems(page, lastPage, siblingCount)
  const isDisabled = disabled || lastPage <= 1

  const goTo = (next: number) => {
    if (isDisabled) return
    const clamped = Math.min(Math.max(1, next), lastPage)
    if (clamped !== page) onPageChange(clamped)
  }

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-end gap-1", className)}
      aria-label="Pagination"
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="First page"
        disabled={isDisabled || page <= 1}
        onClick={() => goTo(1)}
      >
        <ChevronFirst className="size-4 rtl:rotate-180" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Previous page"
        disabled={isDisabled || page <= 1}
        onClick={() => goTo(page - 1)}
      >
        <ChevronLeft className="size-4 rtl:rotate-180" />
      </Button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-sm text-muted-foreground"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === page ? "default" : "outline"}
            size="icon-sm"
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            disabled={disabled}
            onClick={() => goTo(item)}
          >
            {item}
          </Button>
        )
      )}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Next page"
        disabled={isDisabled || page >= lastPage}
        onClick={() => goTo(page + 1)}
      >
        <ChevronRight className="size-4 rtl:rotate-180" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Last page"
        disabled={isDisabled || page >= lastPage}
        onClick={() => goTo(lastPage)}
      >
        <ChevronLast className="size-4 rtl:rotate-180" />
      </Button>
    </nav>
  )
}
