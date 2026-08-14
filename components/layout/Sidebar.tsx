"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import {
  Building2,
  Home,
  Globe,
  Settings,
  MapPin,
  X,
  MessageCircle,
  Sparkles,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  Heart,
  Bell,
  Bookmark,
  BarChart3,
  Megaphone,
  Layers,
  Users,
  Wallet,
  KeyRound,
  Tag,
  FolderArchive,
  CreditCard,
  Brain,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { hasPermission, type PermissionName } from "@/lib/permissions"
import { useAuth } from "src/context/AuthContext"
import { useFavorites } from "src/modules/favorites/FavoritesProvider"
import { useNotificationsReact } from "@/hooks/use-notifications-react"
import { Button } from "components/ui/button"

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

type NavItem = {
  href: string
  labelKey: "home" | "publicProperties" | "properties" | "viewings" | "schedule" | "cities" | "chat" | "settings" | "dashboard" | "favorites" | "notifications" | "reviews" | "savedSearches" | "analytics" | "ads" | "adGroups" | "leads" | "appointments" | "deposits" | "rentalCards" | "categories" | "storage" | "plans" | "ai"
  icon: typeof Home
  permission?: PermissionName
  showBadge?: "favorites" | "notifications"
}

const navItems: NavItem[] = [
  { href: "/", labelKey: "dashboard", icon: Home },
  { href: "/properties", labelKey: "publicProperties", icon: Globe },
  { href: "/favorites", labelKey: "favorites", icon: Heart, showBadge: "favorites" },
  { href: "/saved-searches", labelKey: "savedSearches", icon: Bookmark },
  { href: "/notifications", labelKey: "notifications", icon: Bell, showBadge: "notifications" },
  { href: "/reviews", labelKey: "reviews", icon: MessageCircle },
  { href: "/ai", labelKey: "ai", icon: Brain },
  { href: "/dashboard/properties", labelKey: "properties", icon: Building2, permission: "properties.list" },
  { href: "/dashboard/analytics", labelKey: "analytics", icon: BarChart3, permission: "properties.list" },
  { href: "/dashboard/crm", labelKey: "leads", icon: Users },
  { href: "/dashboard/appointments", labelKey: "appointments", icon: CalendarClock },
  { href: "/dashboard/viewings", labelKey: "viewings", icon: CalendarCheck },
  { href: "/dashboard/schedule", labelKey: "schedule", icon: CalendarDays, permission: "properties.list" },
  { href: "/dashboard/ads", labelKey: "ads", icon: Megaphone, permission: "ads.list" },
  { href: "/dashboard/ad-groups", labelKey: "adGroups", icon: Layers, permission: "ads.list" },
  { href: "/dashboard/subscriptions/plans", labelKey: "plans", icon: CreditCard },
  { href: "/dashboard/deposits", labelKey: "deposits", icon: Wallet },
  { href: "/dashboard/rental-cards", labelKey: "rentalCards", icon: KeyRound },
  { href: "/dashboard/categories", labelKey: "categories", icon: Tag },
  { href: "/dashboard/storage", labelKey: "storage", icon: FolderArchive },
  { href: "/dashboard/cities", labelKey: "cities", icon: MapPin, permission: "cities.list" },
  { href: "/chat", labelKey: "chat", icon: MessageCircle },
  { href: "/settings", labelKey: "settings", icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { count: favoritesCount, isHydrated: favoritesHydrated } = useFavorites()
  const { unreadCount } = useNotificationsReact()
  const tNav = useTranslations("nav")
  const tBrand = useTranslations("brand")
  const tSidebar = useTranslations("sidebar")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href === "/" ? "" : href}`

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out lg:static lg:inset-auto rtl:left-auto rtl:right-0 rtl:border-l rtl:border-r-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0 rtl:translate-x-full rtl:lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link
            href={localizedHref("/")}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex items-center justify-center size-8 rounded-lg gradient-primary shadow-md shadow-primary/25 text-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <span className="font-heading font-bold text-base tracking-tight">
              {tBrand("name")}
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon-xs"
            className="lg:hidden hover:bg-muted"
            onClick={onClose}
            aria-label={tCommon("close")}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2" aria-label={tCommon("menu")}>
          {navItems.filter((item) => !item.permission || hasPermission(user, item.permission)).map((item) => {
            const target = localizedHref(item.href)
            const isActive = pathname === target || (item.href !== "/" && pathname.startsWith(target + "/"))
            const badgeCount =
              item.showBadge === "favorites"
                ? favoritesHydrated
                  ? favoritesCount
                  : 0
                : item.showBadge === "notifications"
                ? unreadCount
                : 0
            return (
              <Link
                key={item.href}
                href={target}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
                onClick={onClose}
              >
                <item.icon
                  className={cn(
                    "size-[18px] transition-transform duration-200",
                    !isActive && "group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                  )}
                />
                <span className="flex-1">{tNav(item.labelKey)}</span>
                {badgeCount > 0 && (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                      isActive
                        ? "bg-white/25 text-primary-foreground"
                        : item.showBadge === "notifications"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-primary/15 text-primary"
                    )}
                    aria-label={`${badgeCount} ${tNav(item.labelKey).toLowerCase()}`}
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 via-accent/50 to-primary/5 p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="size-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                {tSidebar("needHelp")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {tSidebar("docsHint")}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-lg border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              {tSidebar("viewDocs")}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
