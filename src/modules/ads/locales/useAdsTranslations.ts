"use client"

import { useLocale } from "next-intl"
import { adsEn, type AdsMessages } from "./en"
import { adsAr } from "./ar"

/**
 * Resolve ads copy for the current locale.
 * Module files stay in sync with `messages/*.json` under the `ads` namespace
 * (including `ads.groups.*`). `common.*` paths used by ads dialogs live on
 * the module catalog so they do not collide with global common keys.
 */
export function getAdsMessages(locale: string | undefined): AdsMessages {
  if (locale && locale.toLowerCase().startsWith("ar")) return adsAr
  return adsEn
}

/**
 * Path-based translator for ads copy (`ads.*`, `ads.groups.*`, `common.*`).
 * Walks the module catalog by dot path so keys such as `ads.groups.newGroup`
 * resolve instead of leaking into the UI.
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
