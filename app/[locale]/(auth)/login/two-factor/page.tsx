"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Building2, KeyRound, Loader2 } from "lucide-react"
import { useAuth } from "src/context/AuthContext"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"

export default function TwoFactorPage() {
  return (
    <Suspense fallback={null}>
      <TwoFactorForm />
    </Suspense>
  )
}

function TwoFactorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyTwoFactor, cancelTwoFactor, pendingTwoFactor } = useAuth()
  const t = useTranslations("auth")
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href === "/" ? "" : href}`
  const [value, setValue] = useState("")
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!value.trim()) return
    setError("")
    setIsLoading(true)
    try {
      if (useRecoveryCode) {
        await verifyTwoFactor(undefined, value.trim())
      } else {
        await verifyTwoFactor(value.trim(), undefined)
      }
      router.push(callbackUrl)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("verificationFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  if (!pendingTwoFactor) {
    if (typeof window !== "undefined") {
      router.replace(localizedHref("/login"))
    }
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl gradient-primary text-primary-foreground mb-4">
            <Building2 className="size-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("twoFactorTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t("twoFactorDescription")}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <label htmlFor="two-factor-code" className="text-sm font-medium">
                {useRecoveryCode ? t("twoFactorRecoveryLabel") : t("twoFactorCodeLabel")}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input
                  id="two-factor-code"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="pl-10 h-11 rounded-lg rtl:pl-3 rtl:pr-10"
                  autoComplete={useRecoveryCode ? "off" : "one-time-code"}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading || !value.trim()}>
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin rtl:mr-0 rtl:ml-2" /> : null}
              {t("twoFactorSubmit")}
            </Button>
          </form>

          <button
            type="button"
            className="w-full mt-5 text-sm text-primary hover:text-primary/80"
            onClick={() => {
              setUseRecoveryCode((current) => !current)
              setValue("")
              setError("")
            }}
          >
            {useRecoveryCode ? t("twoFactorUseAuthenticator") : t("twoFactorUseRecovery")}
          </button>
          <button
            type="button"
            className="block text-center mt-4 text-sm text-muted-foreground hover:text-foreground w-full"
            onClick={() => {
              cancelTwoFactor()
              router.replace(localizedHref("/login"))
            }}
          >
            {t("returnToLogin")}
          </button>
        </div>
      </div>
    </div>
  )
}
