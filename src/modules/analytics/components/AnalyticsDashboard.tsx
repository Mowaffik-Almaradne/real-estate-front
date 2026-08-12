"use client"

import { Eye, Heart, MessageCircle, Percent, TrendingUp } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Skeleton } from "components/ui/skeleton"

import { AnalyticsChart } from "./AnalyticsChart"
import { AnalyticsKpiCard } from "./AnalyticsKpiCard"
import { AnalyticsRangePicker } from "./AnalyticsRangePicker"
import { useAnalytics } from "../hooks/useAnalytics"
import type { AnalyticsMetric, AnalyticsSummary } from "../types"

interface AnalyticsDashboardProps {
  initialRange?: "7d" | "30d" | "90d" | "12m"
  initialPropertyId?: number | null
}

function seriesFor(
  summary: AnalyticsSummary | null,
  metric: AnalyticsMetric
): { value: number; change: number; points: readonly { date: string; value: number }[] } {
  if (!summary) return { value: 0, change: 0, points: [] }
  const series = summary.series.find((s) => s.metric === metric)
  return {
    value: series?.total ?? 0,
    change: series?.previous_total
      ? ((series.total - series.previous_total) / series.previous_total) * 100
      : 0,
    points: series?.points ?? [],
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsDashboard({
  initialRange = "30d",
  initialPropertyId = null,
}: AnalyticsDashboardProps) {
  const t = useTranslations("analytics")
  const {
    summary,
    isLoading,
    error,
    range,
    setRange,
    refresh,
  } = useAnalytics(initialRange, initialPropertyId)

  if (isLoading && !summary) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("retry")}
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center text-sm text-muted-foreground">
          <p>{t("empty")}</p>
        </CardContent>
      </Card>
    )
  }

  const views = seriesFor(summary, "views")
  const contacts = seriesFor(summary, "contacts")
  const favorites = seriesFor(summary, "favorites")
  const viewings = seriesFor(summary, "viewings")

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t("summary")}</h2>
          <p className="text-sm text-muted-foreground">{t("summaryHint")}</p>
        </div>
        <AnalyticsRangePicker
          value={range}
          onChange={setRange}
          disabled={isLoading}
        />
      </div>

      {summary.source === "basic" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-sm text-muted-foreground">
            {t("basicNotice")}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsKpiCard
          title={t("metrics.views")}
          value={summary.total_views}
          changePercent={summary.views_change}
          icon={Eye}
          testId="analytics-kpi-views"
        />
        <AnalyticsKpiCard
          title={t("metrics.contacts")}
          value={summary.total_contacts}
          changePercent={summary.contacts_change}
          icon={MessageCircle}
          testId="analytics-kpi-contacts"
        />
        <AnalyticsKpiCard
          title={t("metrics.favorites")}
          value={summary.total_favorites}
          changePercent={summary.favorites_change}
          icon={Heart}
          testId="analytics-kpi-favorites"
        />
        <AnalyticsKpiCard
          title={t("metrics.conversion_rate")}
          value={summary.conversion_rate}
          changePercent={summary.viewings_change}
          icon={Percent}
          testId="analytics-kpi-conversion"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4" aria-hidden />
            {t("trends")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <AnalyticsChart metric="views" points={views.points} />
          <AnalyticsChart metric="contacts" points={contacts.points} />
          <AnalyticsChart metric="favorites" points={favorites.points} />
          <AnalyticsChart metric="viewings" points={viewings.points} />
        </CardContent>
      </Card>

      {summary.top_properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("topProperties")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.top_properties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
              >
                <p className="truncate text-sm font-medium">{property.title}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3" aria-hidden />
                    {property.views}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="size-3" aria-hidden />
                    {property.contacts}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3" aria-hidden />
                    {property.favorites}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}