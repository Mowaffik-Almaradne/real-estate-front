"use client"

import { useState } from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { CalendarClock, Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Skeleton } from "components/ui/skeleton"

import {
  CancelSubscriptionDialog,
  SubscriptionStatusBadge,
  useCurrentSubscription,
  useSubscriptionFeatureAccess,
  useSubscriptionsTranslations,
} from "src/modules/subscriptions"
import { SubscriptionStatus } from "@/types/enums"

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

export default function CurrentSubscriptionPage() {
  const locale = useLocale()
  const { t } = useSubscriptionsTranslations()
  const { subscription, loading, error, cancelling, refresh } =
    useCurrentSubscription()
  const featuresHook = useSubscriptionFeatureAccess()
  const [cancelOpen, setCancelOpen] = useState(false)

  const remainingDays = subscription?.remaining_days
  const remainingText =
    remainingDays == null
      ? t("lifecycle.current.remainingExpired")
      : t("lifecycle.current.remainingLabel", { days: remainingDays })

  const isActive = subscription?.status === SubscriptionStatus.active
  const isCancelled = subscription?.status === SubscriptionStatus.cancelled

  if (loading && !subscription) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error && !subscription) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("lifecycle.notFound")}
          </p>
          <Link
            href={`/${locale}/subscriptions/plans`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium bg-primary px-4 py-2 text-primary-foreground"
          >
            {t("lifecycle.current.browsePlans")}
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("lifecycle.current.title")}</CardTitle>
            <SubscriptionStatusBadge status={subscription.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1 rounded-md border p-3">
              <p className="text-xs text-muted-foreground">
                {t("lifecycle.current.planLabel")}
              </p>
              <p className="font-medium">{subscription.plan?.name ?? "—"}</p>
              {subscription.plan?.description && (
                <p className="text-xs text-muted-foreground">
                  {subscription.plan.description}
                </p>
              )}
            </div>
            <div className="space-y-1 rounded-md border p-3">
              <p className="text-xs text-muted-foreground">
                {t("lifecycle.current.statusLabel")}
              </p>
              <p className="font-medium">{remainingText}</p>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="size-3" />
                {formatDate(subscription.ends_at)}
              </p>
            </div>
            <div className="space-y-1 rounded-md border p-3">
              <p className="text-xs text-muted-foreground">
                {t("lifecycle.current.startsAtLabel")}
              </p>
              <p className="font-medium">{formatDate(subscription.starts_at)}</p>
            </div>
            <div className="space-y-1 rounded-md border p-3">
              <p className="text-xs text-muted-foreground">
                {t("lifecycle.current.endsAtLabel")}
              </p>
              <p className="font-medium">{formatDate(subscription.ends_at)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {isActive && !isCancelled && (
              <Button
                variant="destructive"
                onClick={() => setCancelOpen(true)}
                disabled={cancelling}
              >
                {cancelling && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {t("lifecycle.current.cancel")}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => void refresh()}
              disabled={loading}
            >
              {t("common.refresh", { defaultValue: "Refresh" })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("lifecycle.features.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {featuresHook.loading && featuresHook.features.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full" />
              ))}
            </div>
          ) : featuresHook.features.length === 0 ? (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("lifecycle.features.empty")}
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {featuresHook.features.map((feature) => (
                <li
                  key={feature.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{feature.name}</p>
                    {feature.description && (
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs">
                    <p>
                      {feature.is_enabled
                        ? t("lifecycle.features.enabled")
                        : t("lifecycle.features.disabled")}
                    </p>
                    {feature.limit_value != null ? (
                      <p className="text-muted-foreground">
                        {t("lifecycle.features.limitValue", {
                          value: feature.limit_value,
                        })}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        {t("lifecycle.features.limitUnset")}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CancelSubscriptionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onCancelled={refresh}
      />
    </div>
  )
}
