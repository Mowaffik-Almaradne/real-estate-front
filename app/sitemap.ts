import type { MetadataRoute } from "next"
import { defaultLocale, locales } from "@/i18n/config"
import { buildAbsoluteUrl } from "src/lib/seo"

const PUBLIC_PATHS = [
  "",
  "/properties",
  "/chat",
  "/favorites",
  "/notifications",
  "/saved-searches",
  "/reviews",
  "/settings",
  "/compare",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []
  for (const locale of locales) {
    for (const path of PUBLIC_PATHS) {
      const url = buildAbsoluteUrl(
        locale === defaultLocale ? path : `/${locale}${path === "" ? "" : path}`
      )
      entries.push({
        url,
        lastModified: now,
        changeFrequency: "daily",
        priority: path === "" ? 1.0 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l,
              buildAbsoluteUrl(
                l === defaultLocale ? path : `/${l}${path === "" ? "" : path}`
              ),
            ])
          ),
        },
      })
    }
  }
  return entries
}
