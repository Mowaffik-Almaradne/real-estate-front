"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import { locales, isLocale } from "@/i18n/config"

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const t = useTranslations("common")
  const [isPending, startTransition] = useTransition()

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value
    if (!isLocale(next) || next === currentLocale) return
    const segments = pathname.split("/")
    if (segments.length > 1 && isLocale(segments[1])) {
      segments[1] = next
    } else {
      segments.unshift(next)
    }
    const target = segments.join("/") || `/${next}`
    startTransition(() => {
      router.replace(target)
    })
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-border bg-background/80 px-2 py-1 text-xs shadow-sm backdrop-blur">
      <span className="sr-only">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={currentLocale}
        onChange={onChange}
        disabled={isPending}
        className="bg-transparent outline-none cursor-pointer"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc === "en" ? "english" : "arabic")}
          </option>
        ))}
      </select>
    </label>
  )
}
