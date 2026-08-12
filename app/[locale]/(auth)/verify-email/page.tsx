"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "components/ui/button"
import { authService } from "@/services/auth-service"

export default function VerifyEmailPage() {
  return <Suspense fallback={null}><VerifyEmailContent /></Suspense>
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const t = useTranslations("auth")
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href === "/" ? "" : href}`
  const id = searchParams.get("id")
  const hash = searchParams.get("hash")
  const queryParams = new URLSearchParams(searchParams.toString())
  queryParams.delete("id")
  queryParams.delete("hash")
  const query = queryParams.toString()
  const isMissing = !id || !hash

  const [state, setState] = useState<"loading" | "success" | "error">(
    isMissing ? "error" : "loading"
  )
  const [message, setMessage] = useState(
    isMissing ? t("verifyEmailInvalidLink") : ""
  )

  useEffect(() => {
    if (isMissing || !id || !hash) return

    let cancelled = false
    authService.verifyEmail(id, hash, query).then(() => {
      if (!cancelled) setState("success")
    }).catch((error: unknown) => {
      if (!cancelled) {
        setState("error")
        setMessage(error instanceof Error ? error.message : t("verificationFailed"))
      }
    })
    return () => {
      cancelled = true
    }
  }, [searchParams, isMissing, id, hash, query, t])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center shadow-xl shadow-black/5">
        {state === "loading" && <Loader2 className="size-10 animate-spin text-primary mx-auto" />}
        {state === "success" && <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />}
        <h1 className="text-2xl font-bold tracking-tight mt-4">
          {state === "success"
            ? t("verifyEmailSuccess")
            : state === "error"
            ? t("verifyEmailError")
            : t("verifyEmailLoading")}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {state === "success"
            ? t("verifyEmailSuccessDescription")
            : state === "error"
            ? message
            : t("verifyEmailLoadingDescription")}
        </p>
        {state !== "loading" && (
          <Link href={localizedHref("/login")}>
            <Button className="mt-6">{t("verifyEmailContinue")}</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
