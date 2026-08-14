"use client"

import { useLocale } from "next-intl"
import { categoriesEn, type CategoriesMessages } from "./en"
import { categoriesAr } from "./ar"

export function getCategoriesMessages(locale: string | undefined): CategoriesMessages {
  if (locale && locale.toLowerCase().startsWith("ar")) return categoriesAr
  return categoriesEn
}

export function useCategoriesTranslations(): {
  t: (path: string, vars?: Record<string, string | number>) => string
} {
  const locale = useLocale()
  const messages = getCategoriesMessages(locale)

  const format = (template: string, vars?: Record<string, string | number>): string => {
    if (!vars) return template
    return template.replace(/\{(\w+)\}/g, (match, key: string) => {
      const value = vars[key]
      return value == null ? match : String(value)
    })
  }

  const lookup = (path: string): string => {
    const segments = path.split(".")
    let current: unknown = messages
    for (const segment of segments) {
      if (current == null || typeof current !== "object") return path
      current = (current as Record<string, unknown>)[segment]
    }
    return typeof current === "string" ? current : path
  }

  const t = (path: string, vars?: Record<string, string | number>): string => {
    const value = lookup(path)
    return format(value, vars)
  }

  return { t }
}
