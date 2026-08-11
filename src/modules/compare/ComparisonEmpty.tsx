"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { GitCompareArrows } from "lucide-react"

import { Button } from "components/ui/button"
import { Card } from "components/ui/card"

interface ComparisonEmptyProps {
  locale: string
}

export function ComparisonEmpty({ locale }: ComparisonEmptyProps) {
  const t = useTranslations("compare")
  const router = useRouter()
  return (
    <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <GitCompareArrows className="size-8 text-primary" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t("emptyTitle")}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {t("emptyDescription")}
        </p>
      </div>
      <Button onClick={() => router.push(`/${locale}/properties`)}>
        {t("browseProperties")}
      </Button>
    </Card>
  )
}