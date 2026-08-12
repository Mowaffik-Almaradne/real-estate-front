"use client"

import { useState } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { authService } from "@/services/auth-service"

export default function ForgotPasswordPage() {
  const t = useTranslations("auth")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href === "/" ? "" : href}`
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await authService.requestPasswordReset(email)
      setSent(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : tCommon("error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <Link href={localizedHref("/login")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t("backToLogin")}
        </Link>
        <div className="glass-card rounded-2xl p-8 shadow-xl shadow-black/5">
          <h1 className="text-2xl font-bold tracking-tight">{t("forgotPasswordTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            {t("forgotPasswordDescription")}
          </p>
          {sent ? (
            <div className="space-y-4" role="status">
              <p className="rounded-lg bg-primary/10 p-4 text-sm text-foreground">
                {t("forgotPasswordSent")}
              </p>
              <Link href={localizedHref("/login")} className="block text-center text-sm text-primary hover:text-primary/80">{t("returnToLogin")}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("emailPlaceholder")} className="pl-10 h-11 rounded-lg rtl:pl-3 rtl:pr-10" required />
              </div>
              <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 size-4 animate-spin rtl:mr-0 rtl:ml-2" /> : null}
                {t("forgotPasswordSubmit")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
