"use client"

import { useEffect, useState } from "react"
import { Check, Copy, Loader2, Mail, RefreshCw, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Textarea } from "components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { useAuth } from "src/context/AuthContext"
import { authService } from "@/services/auth-service"
import {
  AvatarUpload,
  ConfirmPasswordDialog,
  SocialLinksEditor,
  type SocialLinksMap,
} from "src/modules/auth"

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", website: "", description: "" })
  const [contactPreference, setContactPreference] = useState<"chat" | "external">("chat")
  const [socialLinks, setSocialLinks] = useState<SocialLinksMap>({})
  const [password, setPassword] = useState({ current_password: "", password: "", password_confirmation: "" })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingPublisher, setSavingPublisher] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [confirmTwoFactorOpen, setConfirmTwoFactorOpen] = useState(false)
  const [confirmDisableTwoFactorOpen, setConfirmDisableTwoFactorOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    setProfile({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      website: user.website_url || "",
      description: user.description || "",
    })
    setTwoFactorEnabled(user.two_factor_enabled ?? false)
    setContactPreference(user.contact_preference ?? "chat")
    setSocialLinks({ ...(user.social_links ?? {}) })
  }, [user])

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const updatedUser = await authService.updateProfile({ name: profile.name, email: profile.email })
      updateUser({ ...user, ...updatedUser })
      toast.success("Profile updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePublisherSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingPublisher(true)
    try {
      const updatedUser = await authService.updatePublisherProfile({
        phone: profile.phone,
        website: profile.website,
        description: profile.description,
        social_links: socialLinks,
      })
      const contactUpdatedUser = await authService.updateContactPreference(contactPreference)
      updateUser({ ...user, ...updatedUser, ...contactUpdatedUser })
      toast.success("Publisher profile updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update publisher profile")
    } finally {
      setSavingPublisher(false)
    }
  }

  const handleAvatarUploaded = async (avatarId: string) => {
    const updatedUser = await authService.updatePublisherProfile({ avatar: avatarId })
    updateUser({ ...user, ...updatedUser })
  }

  const handleAvatarRemoved = async () => {
    const updatedUser = await authService.updatePublisherProfile({ avatar: null })
    updateUser({ ...user, ...updatedUser })
  }

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (password.password !== password.password_confirmation) {
      toast.error("New passwords do not match")
      return
    }
    setSavingPassword(true)
    try {
      await authService.updatePassword(password)
      setPassword({ current_password: "", password: "", password_confirmation: "" })
      toast.success("Password updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password")
    } finally {
      setSavingPassword(false)
    }
  }

  const resendVerification = async () => {
    setResendingVerification(true)
    try {
      await authService.resendVerificationEmail()
      toast.success("Verification email sent")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send verification email")
    } finally {
      setResendingVerification(false)
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
      toast.success("Two-factor authentication is ready to confirm")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start two-factor setup")
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
      toast.success("Two-factor authentication enabled")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid authentication code")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const regenerateRecoveryCodes = async () => {
    setTwoFactorLoading(true)
    try {
      await authService.regenerateRecoveryCodes()
      setRecoveryCodes(await authService.getRecoveryCodes())
      toast.success("Recovery codes regenerated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not regenerate recovery codes")
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
      toast.success("Two-factor authentication disabled")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not disable two-factor authentication")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  if (!user) {
    return <DashboardLayout title="Settings"><p className="text-muted-foreground">Loading account...</p></DashboardLayout>
  }

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your identity, publisher profile, password, and security.</p>
        </div>

        {!user.email_verified_at && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Mail className="size-5 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium">Verify your email</p>
                  <p className="text-xs text-muted-foreground">
                    We sent a verification link to <span className="font-medium">{user.email}</span>. Confirm it to unlock all features.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resendVerification}
                disabled={resendingVerification}
              >
                {resendingVerification ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Resend verification email
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Personal information</CardTitle><CardDescription>These details identify you across the platform.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Name<Input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} required /></label>
              <label className="space-y-2 text-sm font-medium">Email<Input type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} required /></label>
              <div className="sm:col-span-2 flex items-center justify-end">
                <Button type="submit" disabled={savingProfile}>{savingProfile ? <Loader2 className="size-4 animate-spin" /> : null}Save personal information</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Publisher profile</CardTitle><CardDescription>Information shown to people viewing your listings.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handlePublisherSubmit} className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium">Avatar</p>
                <AvatarUpload
                  currentUrl={user.avatar_url}
                  alt={user.name}
                  onUploaded={handleAvatarUploaded}
                  onRemoved={handleAvatarRemoved}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">Phone<Input value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} /></label>
                <label className="space-y-2 text-sm font-medium">Website<Input type="url" value={profile.website} onChange={(event) => setProfile((current) => ({ ...current, website: event.target.value }))} /></label>
              </div>
              <label className="space-y-2 text-sm font-medium">Description<Textarea value={profile.description} onChange={(event) => setProfile((current) => ({ ...current, description: event.target.value }))} rows={4} /></label>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Contact preference</legend>
                <div className="flex flex-wrap gap-2">
                  {(["chat", "external"] as const).map((preference) => (
                    <Button key={preference} type="button" variant={contactPreference === preference ? "default" : "outline"} onClick={() => setContactPreference(preference)}>
                      {preference === "chat" ? "Internal chat" : "External contact"}
                    </Button>
                  ))}
                </div>
              </fieldset>
              <div className="space-y-2">
                <p className="text-sm font-medium">Social links</p>
                <SocialLinksEditor value={socialLinks} onChange={setSocialLinks} />
              </div>
              <Button type="submit" disabled={savingPublisher}>{savingPublisher ? <Loader2 className="size-4 animate-spin" /> : null}Save publisher profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Change password</CardTitle><CardDescription>Use at least eight characters and avoid reusing passwords.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="grid gap-4 sm:grid-cols-3">
              <Input type="password" placeholder="Current password" value={password.current_password} onChange={(event) => setPassword((current) => ({ ...current, current_password: event.target.value }))} required />
              <Input type="password" placeholder="New password" minLength={8} value={password.password} onChange={(event) => setPassword((current) => ({ ...current, password: event.target.value }))} required />
              <Input type="password" placeholder="Confirm password" minLength={8} value={password.password_confirmation} onChange={(event) => setPassword((current) => ({ ...current, password_confirmation: event.target.value }))} required />
              <Button type="submit" disabled={savingPassword} className="sm:col-span-3 sm:w-fit">{savingPassword ? <Loader2 className="size-4 animate-spin" /> : null}Update password</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" />Two-factor authentication</CardTitle><CardDescription>Protect your account with an authenticator app and recovery codes.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            {twoFactorEnabled && !qrCode ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><Check className="size-4" />Two-factor authentication is enabled</p>
                <Button type="button" variant="outline" onClick={regenerateRecoveryCodes} disabled={twoFactorLoading}><RefreshCw className="size-4" />Regenerate codes</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirmDisableTwoFactorOpen(true)}
                  disabled={twoFactorLoading}
                >
                  Disable
                </Button>
              </div>
            ) : !qrCode ? (
              <Button type="button" onClick={startTwoFactorSetup} disabled={twoFactorLoading}>{twoFactorLoading ? <Loader2 className="size-4 animate-spin" /> : null}Set up two-factor authentication</Button>
            ) : (
              <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                <div className="rounded-xl border bg-white p-3" aria-label="Two-factor QR code" dangerouslySetInnerHTML={{ __html: qrCode }} />
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Scan the QR code, then enter the six-digit code generated by your authenticator.</p>
                  {secretKey && <code className="block rounded-lg bg-muted p-3 text-sm break-all">{secretKey}</code>}
                  <div className="flex gap-2"><Input inputMode="numeric" placeholder="123456" value={confirmationCode} onChange={(event) => setConfirmationCode(event.target.value)} /><Button type="button" onClick={confirmTwoFactorSetup} disabled={twoFactorLoading || !confirmationCode}>{twoFactorLoading ? <Loader2 className="size-4 animate-spin" /> : null}Confirm</Button></div>
                </div>
              </div>
            )}
            {recoveryCodes.length > 0 && <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><p className="text-sm font-medium mb-3">Save these recovery codes somewhere secure.</p><div className="grid grid-cols-2 gap-2 text-sm font-mono">{recoveryCodes.map((code) => <code key={code} className="rounded bg-background p-2">{code}</code>)}</div><Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => navigator.clipboard.writeText(recoveryCodes.join("\n"))}><Copy className="size-4" />Copy codes</Button></div>}
          </CardContent>
        </Card>
      </div>

      <ConfirmPasswordDialog
        open={confirmTwoFactorOpen}
        onOpenChange={setConfirmTwoFactorOpen}
        title="Confirm to continue"
        description="Re-enter your password to confirm this action."
        onConfirmed={() => {
          // Hook for future sensitive actions (e.g. delete account, change email)
          setConfirmTwoFactorOpen(false)
        }}
      />

      <ConfirmPasswordDialog
        open={confirmDisableTwoFactorOpen}
        onOpenChange={setConfirmDisableTwoFactorOpen}
        title="Disable two-factor authentication?"
        description="For your security, please re-enter your password to disable 2FA."
        onConfirmed={disableTwoFactor}
      />
    </DashboardLayout>
  )
}
