"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Skeleton } from "components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table"

import {
  SubscriptionStatusBadge,
  useCurrentSubscription,
  useSubscriptionStatusLogs,
  useSubscriptionsTranslations,
} from "src/modules/subscriptions"

export default function CurrentSubscriptionStatusLogsPage() {
  const locale = useLocale()
  const { t } = useSubscriptionsTranslations()
  const { subscription, loading: subLoading, error: subError } =
    useCurrentSubscription()
  const subscriptionId = subscription?.id ?? null
  const { logs, loading, error, refresh } =
    useSubscriptionStatusLogs(subscriptionId)
  const [busy, setBusy] = useState(false)

  const handleRefresh = async () => {
    setBusy(true)
    try {
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (subError) {
      // surface nothing — the page already renders its own error message
    }
  }, [subError])

  if (subLoading && !subscription) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-10 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <p className="text-sm text-muted-foreground">
            {t("lifecycle.notFound")}
          </p>
          <Link
            href={`/${locale}/dashboard/subscriptions/current`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium border border-border bg-background px-4 py-2"
          >
            <ArrowLeft className="mr-2 size-4" />
            {t("lifecycle.title")}
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{t("lifecycle.statusLogs.title")}</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleRefresh()}
            disabled={busy}
          >
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && logs.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : logs.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("lifecycle.statusLogs.empty")}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("lifecycle.statusLogs.columns.from")}</TableHead>
                  <TableHead>{t("lifecycle.statusLogs.columns.to")}</TableHead>
                  <TableHead>{t("lifecycle.statusLogs.columns.notes")}</TableHead>
                  <TableHead>{t("lifecycle.statusLogs.columns.when")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.from_status ? (
                        <SubscriptionStatusBadge status={log.from_status} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <SubscriptionStatusBadge status={log.to_status} />
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate text-sm text-muted-foreground">
                      {log.notes ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
