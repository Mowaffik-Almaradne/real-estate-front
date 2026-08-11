"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Loader2, Mail, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Textarea } from "components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { useAuth } from "src/context/AuthContext"
import { authService } from "@/services/auth-service"
import {
  AvatarUpload,
  SocialLinksEditor,
  type SocialLinksMap,
} from "src/modules/auth"

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth()
  const t = useTranslations("settings.profile")
  const tAuth = useTranslations("auth")
  const tCommon = useTranslations("common")
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", website: "", description: "" })
  const [contactPreference, setContactPreference] = useState<"chat" | "external">("chat")
  const [socialLinks, setSocialLinks] = useState<SocialLinksMap>({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPublisher, setSavingPublisher] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [prevUser, setPrevUser] = useState(user)

  if (user !== prevUser) {
    setPrevUser(user)
    if (user && !hydrated) {
      setProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        website: user.website_url || "",
        description: user.description || "",
      })
      setContactPreference(user.contact_preference ?? "chat")
      setSocialLinks({ ...(user.social_links ?? {}) })
      setHydrated(true)
    }
  }

  if (!user) {
    return <p className="text-sm text-muted-foreground">{t("loadingAccount")}</p>
  }

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const updatedUser = await authService.updateProfile({
        name: profile.name,
        email: profile.email,
      })
      updateUser({ ...user, ...updatedUser })
      toast.success(t("profileUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
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
      toast.success(t("publisherProfileUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
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

  const resendVerification = async () => {
    setResendingVerification(true)
    try {
      await authService.resendVerificationEmail()
      toast.success(t("verificationEmailSent"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    } finally {
      setResendingVerification(false)
    }
  }

  return (
    <>
      {!user.email_verified_at && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Mail className="size-5 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium">{t("verifyEmailBanner")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("verifyEmailDescription", { email: user.email })}
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
              {t("resendVerification")}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("personalInfo")}</CardTitle>
          <CardDescription>{t("personalInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              {tAuth("name")}
              <Input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              {tAuth("email")}
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </label>
            <div className="sm:col-span-2 flex items-center justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <Loader2 className="size-4 animate-spin" /> : null}
                {t("savePersonalInfo")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("publisherProfile")}</CardTitle>
          <CardDescription>{t("publisherDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePublisherSubmit} className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("avatar")}</p>
              <AvatarUpload
                currentUrl={user.avatar_url}
                alt={user.name}
                onUploaded={handleAvatarUploaded}
                onRemoved={handleAvatarRemoved}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                {t("phone")}
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {t("website")}
                <Input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                />
              </label>
            </div>
            <label className="space-y-2 text-sm font-medium">
              {t("bio")}
              <Textarea
                value={profile.description}
                onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                rows={4}
              />
            </label>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">{t("contactPreference")}</legend>
              <div className="flex flex-wrap gap-2">
                {(["chat", "external"] as const).map((preference) => (
                  <Button
                    key={preference}
                    type="button"
                    variant={contactPreference === preference ? "default" : "outline"}
                    onClick={() => setContactPreference(preference)}
                  >
                    {preference === "chat" ? t("internalChat") : t("externalContact")}
                  </Button>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("socialLinks")}</p>
              <SocialLinksEditor value={socialLinks} onChange={setSocialLinks} />
            </div>
            <Button type="submit" disabled={savingPublisher}>
              {savingPublisher ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("savePublisherProfile")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
