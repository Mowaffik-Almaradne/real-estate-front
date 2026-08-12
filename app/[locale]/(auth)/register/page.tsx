"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Building2, Loader2, Mail, Lock, User, Eye, EyeOff, AlertCircle, X } from "lucide-react"
import { useAuth } from "src/context/AuthContext"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const t = useTranslations("auth")
  const tBrand = useTranslations("brand")
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href === "/" ? "" : href}`
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== passwordConfirmation) {
      setError(t("passwordsDoNotMatch"))
      return
    }

    setIsLoading(true)

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      router.push(`/${locale}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registrationFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 stagger-children-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-xl gradient-primary shadow-lg shadow-primary/25 text-primary-foreground mb-4">
            <Building2 className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("registerTitle")}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("registerDescription").replace("RealEstate", tBrand("name"))}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm font-medium flex-1 leading-snug">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 opacity-70 hover:opacity-100 transition-opacity -mt-0.5 -mr-0.5 p-0.5 rounded-lg rtl:-mr-0.5 rtl:-ml-0.5"
                  aria-label={t("dismissError")}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t("name")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t("namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 rounded-lg rtl:pl-3 rtl:pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailFieldPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-lg rtl:pl-3 rtl:pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordCreatePlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-lg rtl:pl-10 rtl:pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rtl:right-auto rtl:left-3"
                  aria-label={t("showPassword")}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="passwordConfirmation"
                className="text-sm font-medium"
              >
                {t("passwordConfirmation")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input
                  id="passwordConfirmation"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordConfirmPlaceholder")}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="pl-10 h-11 rounded-lg rtl:pl-3 rtl:pr-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin rtl:mr-0 rtl:ml-2" />
                  {t("creatingAccount")}
                </>
              ) : (
                t("createAccountButton")
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {t("haveAccount")}{" "}
            </span>
            <Link
              href={localizedHref("/login")}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
