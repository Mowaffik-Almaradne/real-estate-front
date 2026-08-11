"use client"

import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Bell, Shield, User, Settings2 } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

export type SettingsTab = "profile" | "security" | "notifications" | "account"

const TABS: { id: SettingsTab; icon: typeof User }[] = [
  { id: "profile", icon: User },
  { id: "security", icon: Shield },
  { id: "notifications", icon: Bell },
  { id: "account", icon: Settings2 },
]

export interface SettingsSidebarProps {
  className?: string
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const t = useTranslations("settings.tabs")
  const locale = useLocale()
  const pathname = usePathname()

  function isActive(tab: SettingsTab): boolean {
    const target = `/${locale}/settings/${tab}`
    return pathname === target || pathname.startsWith(target + "/")
  }

  return (
    <nav
      aria-label={t("label")}
      className={cn(
        "flex flex-row gap-1 overflow-x-auto rounded-lg border bg-card p-1 lg:flex-col lg:overflow-visible",
        className
      )}
    >
      {TABS.map(({ id, icon: Icon }) => (
        <Link
          key={id}
          href={`/${locale}/settings/${id}`}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
            isActive(id)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
          {t(id)}
        </Link>
      ))}
    </nav>
  )
}
