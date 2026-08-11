"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Download, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { useInstallPrompt } from "src/lib/use-online"

export function InstallPrompt() {
  const t = useTranslations("pwa")
  const { canInstall, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  async function handleInstall() {
    const accepted = await promptInstall()
    if (accepted) {
      toast.success(t("installSuccess"))
    } else {
      setDismissed(true)
    }
  }

  return (
    <Card
      data-testid="install-prompt"
      className="border-primary/30 bg-primary/5"
    >
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Download className="size-4" aria-hidden />
          </span>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">{t("installTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("installDescription")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            aria-label={t("dismiss")}
          >
            <X className="size-4" aria-hidden />
          </Button>
          <Button type="button" size="sm" onClick={handleInstall}>
            {t("install")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}