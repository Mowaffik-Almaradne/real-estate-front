import Link from "next/link"
import { Home, Search } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { defaultLocale } from "@/i18n/config"
import { buttonVariants } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"

export default async function NotFound() {
  const t = await getTranslations({ locale: defaultLocale, namespace: "errors" })

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-6xl font-bold tracking-tight text-primary">404</p>
          <h1 className="text-2xl font-bold">{t("notFoundTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("notFoundDescription")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/"
              className={buttonVariants({ size: "default" })}
              aria-label={t("goHome")}
            >
              <Home className="size-4" aria-hidden />
              {t("goHome")}
            </Link>
            <Link
              href="/properties"
              className={buttonVariants({ size: "default", variant: "outline" })}
              aria-label={t("browseProperties")}
            >
              <Search className="size-4" aria-hidden />
              {t("browseProperties")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
