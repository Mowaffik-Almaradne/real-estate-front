"use client"

import { useEffect, useState } from "react"
import { Loader2, Mail, Bell, Smartphone } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Switch } from "components/ui/switch"
import { authService, type NotificationPreferencesDto } from "@/services/auth-service"

const CATEGORIES = ["messages", "viewings", "property_status", "marketing"] as const
type Category = (typeof CATEGORIES)[number]
const CHANNELS = ["email", "push", "inapp"] as const
type Channel = (typeof CHANNELS)[number]

const DEFAULTS: NotificationPreferencesDto = {
  email_messages: true,
  email_viewings: true,
  email_property_status: true,
  email_marketing: false,
  push_messages: true,
  push_viewings: true,
  push_property_status: false,
  push_marketing: false,
  inapp_messages: true,
  inapp_viewings: true,
  inapp_property_status: true,
  inapp_marketing: false,
}

export default function NotificationsSettingsPage() {
  const t = useTranslations("settings.notifications")
  const tCommon = useTranslations("common")
  const [prefs, setPrefs] = useState<NotificationPreferencesDto>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const remote = await authService.getNotificationPreferences()
        if (active) {
          setPrefs(remote)
          setHasLoaded(true)
        }
      } catch {
        if (active) setHasLoaded(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  function toggle(channel: Channel, category: Category): void {
    const key = `${channel}_${category}` as keyof NotificationPreferencesDto
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSave(): Promise<void> {
    setSaving(true)
    try {
      const updated = await authService.updateNotificationPreferences(prefs)
      setPrefs(updated)
      toast.success(t("saved"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {tCommon("loading")}
      </p>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasLoaded && (
          <p className="text-xs text-muted-foreground">{t("defaultsNote")}</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pe-4 text-start font-medium">{t("category")}</th>
                {CHANNELS.map((channel) => (
                  <th key={channel} className="px-2 py-2 text-center font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {channel === "email" && <Mail className="size-4" />}
                      {channel === "push" && <Smartphone className="size-4" />}
                      {channel === "inapp" && <Bell className="size-4" />}
                      {t(`channel.${channel}`)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((category) => (
                <tr key={category} className="border-b last:border-0">
                  <td className="py-3 pe-4 font-medium">{t(`categories.${category}`)}</td>
                  {CHANNELS.map((channel) => {
                    const key = `${channel}_${category}` as keyof NotificationPreferencesDto
                    return (
                      <td key={channel} className="px-2 py-3 text-center">
                        <Switch
                          checked={Boolean(prefs[key])}
                          onCheckedChange={() => toggle(channel, category)}
                          aria-label={`${t(`channel.${channel}`)} ${t(`categories.${category}`)}`}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
