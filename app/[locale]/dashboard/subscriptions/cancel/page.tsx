"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"

import {
  CancelSubscriptionDialog,
  SubscriptionStatusBadge,
  useCurrentSubscription,
  useSubscriptionsTranslations,
} from "src/modules/subscriptions"

export default function CancelSubscriptionPage() {
  const router = useRouter()
  const locale = useLocale()
  const { t } = useSubscriptionsTranslations()
  const { subscription, loading, refresh } = useCurrentSubscription()
  const [cancelOpen, setCancelOpen] = useState(true)

  if (loading && !subscription) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <p className="text-sm text-muted-foreground">
            {t("lifecycle.notFound")}
          </p>
          <Button variant="outline" onClick={() => router.push(`/${locale}/dashboard/subscriptions/current`)}>
            <ArrowLeft className="mr-2 size-4" />
            {t("lifecycle.title")}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{t("lifecycle.cancel.title")}</CardTitle>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("lifecycle.cancel.description")}
        </p>
        <div className="flex justify-end gap-2">
          <Link
            href={`/${locale}/dashboard/subscriptions/current`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium border border-border bg-background px-4 py-2"
          >
            {t("lifecycle.cancel.keep")}
          </Link>
          <Button
            variant="destructive"
            onClick={() => setCancelOpen(true)}
          >
            {t("lifecycle.cancel.confirm")}
          </Button>
        </div>
      </CardContent>
      <CancelSubscriptionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onCancelled={async () => {
          await refresh()
          router.push(`/${locale}/dashboard/subscriptions/current`)
        }}
      />
    </Card>
  )
}
