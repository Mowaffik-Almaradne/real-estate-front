import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import { defaultLocale, isLocale } from "./config"

export { locales, defaultLocale, rtlLocales, isLocale } from "./config"
export type { Locale } from "./config"

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = isLocale(requested) ? requested : defaultLocale
  let messages: Record<string, unknown>
  try {
    messages = (await import(`../messages/${locale}.json`)).default
  } catch {
    notFound()
  }
  return {
    locale,
    messages,
    timeZone: "UTC",
    now: new Date(),
  }
})
