"use client"

import { useState } from "react"
import { Check, Copy, Loader2, Monitor, RefreshCw, Smartphone, ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { authService } from "@/services/auth-service"
import { useAuth } from "src/context/AuthContext"
import { PasswordInput } from "src/modules/auth/components/PasswordInput"
import { PasswordStrengthMeter } from "src/modules/auth/components/PasswordStrengthMeter"
import { ConfirmPasswordDialog } from "src/modules/auth"
import type { ActiveSessionDto } from "@/services/auth-service"

export default function SecuritySettingsPage() {
  const { user } = useAuth()
  const t = useTranslations("settings.security")
  const tAuth = useTranslations("auth")
  const tCommon = useTranslations("common")
  const [password, setPassword] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.two_factor_enabled ?? false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false)
  const [sessions, setSessions] = useState<ActiveSessionDto[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsLoaded, setSessionsLoaded] = useState(false)

  if (!user) return <p className="text-sm text-muted-foreground">{t("loadingAccount")}</p>

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (password.password !== password.password_confirmation) {
      toast.error(tAuth("passwordsDoNotMatch"))
      return
    }
    setSavingPassword(true)
    try {
      await authService.updatePassword(password)
      setPassword({ current_password: "", password: "", password_confirmation: "" })
      toast.success(t("passwordUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    } finally {
      setSavingPassword(false)
    }
  }

  const startTwoFactorSetup = async () => {
    setTwoFactorLoading(true)
    try {
      await authService.enableTwoFactor()
      const [qr, secret] = await Promise.all([
        authService.getTwoFactorQrCode(),
        authService.getTwoFactorSecretKey(),
      ])
      setQrCode(qr.svg)
      setSecretKey(secret)
      toast.success(t("twoFactorReadyToConfirm"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const confirmTwoFactorSetup = async () => {
    setTwoFactorLoading(true)
    try {
      await authService.confirmTwoFactor(confirmationCode)
      const codes = await authService.getRecoveryCodes()
      setRecoveryCodes(codes)
      setTwoFactorEnabled(true)
      setQrCode(null)
      setSecretKey(null)
      setConfirmationCode("")
      toast.success(t("twoFactorEnabledToast"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const regenerateRecoveryCodes = async () => {
    setTwoFactorLoading(true)
    try {
      await authService.regenerateRecoveryCodes()
      setRecoveryCodes(await authService.getRecoveryCodes())
      toast.success(t("recoveryCodesRegenerated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    setTwoFactorLoading(true)
    try {
      await authService.disableTwoFactor()
      setTwoFactorEnabled(false)
      setRecoveryCodes([])
      toast.success(t("twoFactorDisabledToast"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const loadSessions = async () => {
    setSessionsLoading(true)
    try {
      const list = await authService.getActiveSessions()
      setSessions(list)
      setSessionsLoaded(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    } finally {
      setSessionsLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      await authService.revokeSession(sessionId)
      setSessions((s) => s.filter((x) => x.id !== sessionId))
      toast.success(t("sessions.revoked"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    }
  }

  const revokeAllSessions = async () => {
    try {
      await authService.revokeAllSessions()
      setSessions((s) => s.filter((x) => x.current))
      toast.success(t("sessions.allRevoked"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("changePassword.title")}</CardTitle>
          <CardDescription>{t("changePassword.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm font-medium sm:col-span-1">
                {t("currentPassword")}
                <PasswordInput
                  value={password.current_password}
                  onChange={(e) => setPassword((p) => ({ ...p, current_password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
              </label>
              <label className="space-y-2 text-sm font-medium sm:col-span-1">
                {t("newPassword")}
                <PasswordInput
                  value={password.password}
                  onChange={(e) => setPassword((p) => ({ ...p, password: e.target.value }))}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <label className="space-y-2 text-sm font-medium sm:col-span-1">
                {t("confirmNewPassword")}
                <PasswordInput
                  value={password.password_confirmation}
                  onChange={(e) => setPassword((p) => ({ ...p, password_confirmation: e.target.value }))}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
            </div>
            <PasswordStrengthMeter password={password.password} />
            <div className="flex items-center justify-end">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? <Loader2 className="size-4 animate-spin" /> : null}
                {t("updatePassword")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            {t("twoFactor")}
          </CardTitle>
          <CardDescription>{t("twoFactorDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {twoFactorEnabled && !qrCode ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="size-4" />
                {t("twoFactorEnabled")}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={regenerateRecoveryCodes}
                disabled={twoFactorLoading}
              >
                <RefreshCw className="size-4" />
                {t("regenerateCodes")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmDisableOpen(true)}
                disabled={twoFactorLoading}
              >
                {t("disable")}
              </Button>
            </div>
          ) : !qrCode ? (
            <Button type="button" onClick={startTwoFactorSetup} disabled={twoFactorLoading}>
              {twoFactorLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("setUpTwoFactor")}
            </Button>
          ) : (
            <div className="grid gap-6 md:grid-cols-[180px_1fr]">
              <div
                className="rounded-xl border bg-white p-3"
                aria-label={t("qrCode")}
                dangerouslySetInnerHTML={{ __html: qrCode }}
              />
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("scanQrCode")}</p>
                {secretKey && (
                  <code className="block rounded-lg bg-muted p-3 text-sm break-all">{secretKey}</code>
                )}
                <div className="flex gap-2">
                  <input
                    inputMode="numeric"
                    placeholder="123456"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={confirmTwoFactorSetup}
                    disabled={twoFactorLoading || !confirmationCode}
                  >
                    {twoFactorLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                    {t("confirm")}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {recoveryCodes.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm font-medium mb-3">{t("saveRecoveryCodes")}</p>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {recoveryCodes.map((code) => (
                  <code key={code} className="rounded bg-background p-2">{code}</code>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => navigator.clipboard.writeText(recoveryCodes.join("\n"))}
              >
                <Copy className="size-4" />
                {t("copyCodes")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sessions.title")}</CardTitle>
          <CardDescription>{t("sessions.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!sessionsLoaded ? (
            <Button type="button" variant="outline" onClick={loadSessions} disabled={sessionsLoading}>
              {sessionsLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("sessions.load")}
            </Button>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("sessions.empty")}</p>
          ) : (
            <>
              <ul className="divide-y">
                {sessions.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                      {s.platform === "mobile" ? (
                        <Smartphone className="size-4" />
                      ) : (
                        <Monitor className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {s.browser} · {s.platform}
                        {s.current && (
                          <span className="ms-2 text-xs text-emerald-600">
                            {t("sessions.current")}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.ip_address}
                        {s.location ? ` · ${s.location}` : ""}
                      </p>
                    </div>
                    {!s.current && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeSession(s.id)}
                      >
                        {t("sessions.revoke")}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-end">
                <Button type="button" variant="destructive" size="sm" onClick={revokeAllSessions}>
                  {t("sessions.revokeAll")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmPasswordDialog
        open={confirmDisableOpen}
        onOpenChange={setConfirmDisableOpen}
        title={t("disable")}
        description={tAuth("password")}
        onConfirmed={() => {
          setConfirmDisableOpen(false)
          void disableTwoFactor()
        }}
      />
    </>
  )
}
