import { env } from "@/lib/env"
import { defaultLocale, locales, type Locale } from "@/i18n/config"

export const SITE_NAME = "Real Estate"
export const SITE_DESCRIPTION =
  "Discover, list, and manage real-estate properties with favorites, alerts, and chat."
export const DEFAULT_OG_IMAGE = "/icons/icon-512.svg"

export function buildAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = env.appUrl || "http://localhost:3000"
  if (!path.startsWith("/")) return `${base}/${path}`
  return `${base}${path}`
}

export function buildCanonical(path: string, locale: Locale): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  if (cleanPath === "/") return buildAbsoluteUrl(`/${locale}`)
  return buildAbsoluteUrl(`/${locale}${cleanPath}`)
}

export function buildAlternates(
  path: string,
  currentLocale: Locale
): { canonical: string; languages: Record<string, string> } {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = buildAbsoluteUrl(`/${locale}${cleanPath === "/" ? "" : cleanPath}`)
  }
  languages["x-default"] = buildAbsoluteUrl(`/${defaultLocale}${cleanPath === "/" ? "" : cleanPath}`)
  return {
    canonical: buildCanonical(cleanPath, currentLocale),
    languages,
  }
}