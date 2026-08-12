import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Geist_Mono, Noto_Sans_Arabic } from "next/font/google"
import { ThemeProvider } from "components/providers/ThemeProvider"
import { AuthProvider } from "src/context/AuthContext"
import { FavoritesProvider } from "src/modules/favorites/FavoritesProvider"
import { CompareProviderClient } from "src/modules/compare/CompareProviderClient"
import { Toaster } from "components/ui/sonner"
import { ApiErrorListener } from "components/providers/ApiErrorListener"
import { ServiceWorkerProvider } from "src/components/providers/ServiceWorkerProvider"
import { OfflineBanner } from "src/components/features/pwa/OfflineBanner"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { defaultLocale, locales, rtlLocales, isLocale } from "@/i18n/config"
import {
  buildAlternates,
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "src/lib/seo"
import { LanguageSwitcher } from "components/i18n/LanguageSwitcher"
import "../globals.css"

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const fontArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  const t = await getTranslations({ locale, namespace: "home" })
  const alternates = buildAlternates("/", locale)
  return {
    title: { default: t("title"), template: `%s · ${SITE_NAME}` },
    description: t("description"),
    applicationName: SITE_NAME,
    keywords: [
      "real estate",
      "properties",
      "apartments",
      "villas",
      "rent",
      "sale",
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(alternates.canonical).origin,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: t("title"),
      description: t("description") || SITE_DESCRIPTION,
      url: alternates.canonical,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 512,
          height: 512,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description") || SITE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: SITE_NAME,
    },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()
  const isRtl = rtlLocales.has(locale)
  const dir = isRtl ? "rtl" : "ltr"

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontArabic.variable} ${geistMono.variable} min-h-screen antialiased ${isRtl ? "font-arabic" : ""}`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ServiceWorkerProvider />
            <AuthProvider>
              <FavoritesProvider>
                <CompareProviderClient>
                  <ApiErrorListener />
                  <OfflineBanner />
                  <div className="fixed top-2 right-2 z-50 rtl:right-auto rtl:left-2">
                    <LanguageSwitcher />
                  </div>
                  {children}
                  <Toaster richColors position={isRtl ? "top-left" : "top-right"} />
                </CompareProviderClient>
              </FavoritesProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
