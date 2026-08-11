import { WifiOff } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { buttonVariants } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import Link from "next/link"
import { isLocale, locales } from "@/i18n/config"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OfflinePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) return null
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "pwa" })

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
            <WifiOff className="size-6" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold">{t("offlineTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("offlineDescription")}</p>
          <Link
            href={`/${locale}`}
            className={buttonVariants({ size: "default" })}
          >
            {t("retry")}
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
