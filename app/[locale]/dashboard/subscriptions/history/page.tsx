"use client"

import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"

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
  useSubscriptionHistory,
  useSubscriptionsTranslations,
} from "src/modules/subscriptions"

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString()
}

export default function SubscriptionHistoryPage() {
  const { t } = useSubscriptionsTranslations()
  const { history, loading, error, refresh } = useSubscriptionHistory()
  const [busy, setBusy] = useState(false)

  const handleRefresh = async () => {
    setBusy(true)
    try {
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{t("lifecycle.history.title")}</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleRefresh()}
            disabled={busy}
          >
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && history.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : history.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("lifecycle.history.empty")}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("lifecycle.history.columns.plan")}</TableHead>
                  <TableHead>{t("lifecycle.history.columns.status")}</TableHead>
                  <TableHead>
                    {t("lifecycle.history.columns.startsAt")}
                  </TableHead>
                  <TableHead>{t("lifecycle.history.columns.endsAt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">
                        {item.plan?.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.plan?.slug ?? ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <SubscriptionStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(item.starts_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(item.ends_at)}
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
