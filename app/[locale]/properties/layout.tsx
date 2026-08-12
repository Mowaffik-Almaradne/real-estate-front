import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { defaultLocale, isLocale } from "@/i18n/config"
import {
  buildAlternates,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "src/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  const t = await getTranslations({ locale, namespace: "property" })
  const alternates = buildAlternates("/properties", locale)
  const description = t("browse")
  return {
    title: t("title"),
    description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: `${t("title")} · ${SITE_NAME}`,
      description,
      url: alternates.canonical,
      images: [{ url: DEFAULT_OG_IMAGE, width: 512, height: 512, alt: SITE_NAME }],
    },
  }
}

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
