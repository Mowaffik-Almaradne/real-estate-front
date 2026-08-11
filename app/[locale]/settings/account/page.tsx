"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Moon, Sun, Monitor, Trash2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Label } from "components/ui/label"
import { useTheme } from "next-themes"
import { LanguageSwitcher } from "components/i18n/LanguageSwitcher"
import { authService } from "@/services/auth-service"
import { useAuth } from "src/context/AuthContext"
import { PasswordInput } from "src/modules/auth/components/PasswordInput"

const THEMES = [
  { id: "light", icon: Sun },
  { id: "dark", icon: Moon },
  { id: "system", icon: Monitor },
] as const

export default function AccountSettingsPage() {
  const router = useRouter()
  const locale = useLocale()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const t = useTranslations("settings.account")
  const tCommon = useTranslations("common")
  const [deletePassword, setDeletePassword] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!user) return <p className="text-sm text-muted-foreground">{t("loadingAccount")}</p>

  const handleDelete = async () => {
    if (!deletePassword) return
    setDeleting(true)
    try {
      await authService.deleteAccount(deletePassword)
      toast.success(t("deleted"))
      await logout()
      router.push(`/${locale}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("language.title")}</CardTitle>
          <CardDescription>{t("language.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("appearance.title")}</CardTitle>
          <CardDescription>{t("appearance.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            {THEMES.map(({ id, icon: Icon }) => (
              <Button
                key={id}
                type="button"
                variant={theme === id ? "default" : "outline"}
                onClick={() => setTheme(id)}
                className="h-auto justify-start gap-2 py-3"
              >
                <Icon className="size-4" />
                {t(`appearance.${id}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-5" />
            {t("danger.title")}
          </CardTitle>
          <CardDescription>{t("danger.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!confirmOpen ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              {t("danger.cta")}
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-destructive">{t("danger.warning")}</p>
              <div className="space-y-2">
                <Label htmlFor="delete-confirm-password">{t("danger.passwordLabel")}</Label>
                <PasswordInput
                  id="delete-confirm-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setConfirmOpen(false)
                    setDeletePassword("")
                  }}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!deletePassword || deleting}
                  onClick={handleDelete}
                >
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
                  {t("danger.confirm")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
