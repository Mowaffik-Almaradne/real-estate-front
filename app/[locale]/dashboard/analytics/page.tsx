"use client"

import { useTranslations } from "next-intl"

import { DashboardLayout } from "components/layout/DashboardLayout"
import { AnalyticsDashboard } from "src/modules/analytics/components/AnalyticsDashboard"

export default function AnalyticsPage() {
  const t = useTranslations("analytics")

  return (
    <DashboardLayout title={t("title")}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  )
}