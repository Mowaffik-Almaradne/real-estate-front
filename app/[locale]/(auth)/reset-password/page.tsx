"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { authService } from "@/services/auth-service"

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("auth")
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href === "/" ? "" : href}`
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (password !== confirmation) {
      setError(t("passwordsDoNotMatch"))
      return
    }
    const token = searchParams.get("token") || ""
    if (!token) {
      setError(t("resetLinkInvalid"))
      return
    }

    setError("")
    setIsLoading(true)
    try {
      await authService.resetPassword(email, token, password, confirmation)
      router.push(`${localizedHref("/login")}?reset=success`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("resetLinkInvalid"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <Link href={localizedHref("/login")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="size-4 rtl:rotate-180" /> {t("backToLogin")}</Link>
        <div className="glass-card rounded-2xl p-8 shadow-xl shadow-black/5">
          <h1 className="text-2xl font-bold tracking-tight">{t("resetPasswordTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">{t("resetPasswordDescription")}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("emailPlaceholder")} required />
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("passwordNewPlaceholder")} minLength={8} required />
            <Input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder={t("passwordConfirmNewPlaceholder")} minLength={8} required />
            <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 size-4 animate-spin rtl:mr-0 rtl:ml-2" /> : null}{t("resetPasswordSubmit")}</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
