"use client"

import { useLocale } from "next-intl"
import { adsEn, type AdsMessages } from "./en"
import { adsAr } from "./ar"

/**
 * Resolve the module-local translations for the current locale.
 * Translations live inside the ads module to keep them isolated from the
 * shared `messages/*.json` files.
 */
export function getAdsMessages(locale: string | undefined): AdsMessages {
  if (locale && locale.toLowerCase().startsWith("ar")) return adsAr
  return adsEn
}

/**
 * Lightweight path-based translator for module-local copy.
 * `useTranslations` from next-intl only sees the shared `messages/*.json`
 * namespace, so this hook returns a function that walks the module messages
 * by dot path.
 *
 * Supports interpolation with `{key}` placeholders.
 */
export function useAdsTranslations(): {
  t: (path: string, vars?: Record<string, string | number>) => string
} {
  const locale = useLocale()
  const messages = getAdsMessages(locale)

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
