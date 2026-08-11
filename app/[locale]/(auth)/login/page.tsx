"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Building2, Loader2, Mail, Lock, AlertCircle, X } from "lucide-react"
import { useAuth } from "src/context/AuthContext"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginFlow />
    </Suspense>
  )
}

function LoginFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { sendOtp, verifyOtp } = useAuth()
  const t = useTranslations("auth")
  const tBrand = useTranslations("brand")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href === "/" ? "" : href}`

  const [step, setStep] = useState<"identifier" | "code">("identifier")
  const [identifier, setIdentifier] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await sendOtp(identifier)
      setStep("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await verifyOtp(identifier, code)
      router.push(callbackUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invalidOtp"))
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
          <div className="inline-flex items-center justify-center size-16 rounded-2xl gradient-primary shadow-lg shadow-primary/25 text-primary-foreground mb-4">
            <Building2 className="size-9" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {step === "identifier" ? t("signInTitle") : t("verifyOtp")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {step === "identifier"
              ? t("signInDescription").replace("RealEstate", tBrand("name"))
              : t("otpSentTo", { identifier })}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl shadow-black/5">
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive animate-in fade-in slide-in-from-top-1 duration-200 mb-5"
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

          {step === "identifier" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="identifier" className="text-sm font-medium">
                  {t("identifier")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                  <Input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder={t("identifierPlaceholder")}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 h-11 rounded-lg rtl:pl-3 rtl:pr-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  href={localizedHref("/forgot-password")}
                  className="btn-like text-primary hover:text-primary/80"
                >
                  {t("forgotPassword")}
                </Link>
              </div>

              <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin rtl:mr-0 rtl:ml-2" />
                    {tCommon("loading").replace("...", "")}
                  </>
                ) : (
                  t("sendOtp")
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  {t("otpCodeLabel")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={t("otpCodePlaceholder")}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-lg tracking-widest text-center rtl:pl-10 rtl:pr-10"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading || code.length < 4}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin rtl:mr-0 rtl:ml-2" />
                    {tCommon("loading").replace("...", "")}
                  </>
                ) : (
                  t("verifyOtp")
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("identifier")
                  setCode("")
                  setError("")
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                {t("changeIdentifier")}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {t("noAccount")}{" "}
            </span>
            <Link
              href={localizedHref("/register")}
              className="btn-like text-primary hover:text-primary/80"
            >
              {t("signUp")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
