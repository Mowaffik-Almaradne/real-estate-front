"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { buttonVariants } from "components/ui/button"
import { useSubscriptionsTranslations } from "src/modules/subscriptions"

interface SubscriptionsLayoutProps {
  children: React.ReactNode
}

export default function SubscriptionsLayout({ children }: SubscriptionsLayoutProps) {
  const { t } = useSubscriptionsTranslations()
  const pathname = usePathname()
  const locale = useLocale()
  const segments = pathname.split("/").filter(Boolean)
  const localeIndex = segments.indexOf(locale)
  const rest = localeIndex >= 0 ? segments.slice(localeIndex + 1) : segments

  const isPlans = rest.includes("plans")
  const isFeatures = rest.includes("features")
  const isPlanFeatures = rest.includes("plan-features")

  const pageTitle = isPlanFeatures
    ? t("plans.detail.featuresTitle")
    : isFeatures
      ? t("features.title")
      : isPlans
        ? t("plans.title")
        : t("plans.title")

  const tabs = [
    {
      href: `/${locale}/dashboard/subscriptions/plans`,
      label: t("plans.title"),
      active: isPlans,
    },
    {
      href: `/${locale}/dashboard/subscriptions/features`,
      label: t("features.title"),
      active: isFeatures,
    },
  ]

  return (
    <DashboardLayout title={pageTitle}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) =>
            tab.active ? (
              <span
                key={tab.href}
                className={cn(buttonVariants({ variant: "default", size: "sm" }))}
              >
                {tab.label}
              </span>
            ) : (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {tab.label}
              </Link>
            )
          )}
          <Link
            href={`/${locale}/dashboard/subscriptions/plan-features`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            {t("plans.detail.featuresTitle")}
            <ChevronRight className="ml-1 size-4" />
          </Link>
        </div>

        {children}
      </div>
    </DashboardLayout>
  )
}
