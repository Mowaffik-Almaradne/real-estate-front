"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  /** Optional i18n key — if provided, will be used instead of `label`. */
  labelKey?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const t = useTranslations("breadcrumb")
  return (
    <nav
      aria-label={t("aria")}
      className={cn("flex flex-wrap items-center gap-1 text-xs text-muted-foreground", className)}
    >
      <ol className="flex flex-wrap items-center gap-1" dir="ltr">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          const text = item.labelKey ? t(item.labelKey) : item.label
          return (
            <li key={`${item.href ?? text}-${idx}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded px-1 py-0.5 hover:bg-muted hover:text-foreground"
                >
                  {text}
                </Link>
              ) : (
                <span
                  className={cn(
                    "rounded px-1 py-0.5",
                    isLast && "font-medium text-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {text}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className="size-3 text-muted-foreground/60 rtl:rotate-180"
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}