"use client"

import { useCallback, useEffect, useState } from "react"
import { Building2, Loader2, MessageSquare, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { reviewService } from "@/services/review-service"
import { ApiClientError } from "@/lib/apiClient"
import { ReviewCard } from "src/modules/reviews/components/ReviewCard"
import { SubmitReviewDialog } from "src/modules/reviews/components/SubmitReviewDialog"
import { useDebounce } from "@/hooks"
import { cn } from "@/lib/utils"
import type { ReviewableViewing, ReviewDto, ReviewsResponse } from "@/types/review"

type Tab = "pending" | "mine"

export default function ReviewsPage() {
  const t = useTranslations("reviews")
  const tCommon = useTranslations("common")
  const [tab, setTab] = useState<Tab>("pending")
  const [pending, setPending] = useState<ReviewableViewing[]>([])
  const [mine, setMine] = useState<ReviewDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeViewing, setActiveViewing] = useState<ReviewableViewing | null>(null)
  const debouncedTab = useDebounce(tab, 100)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pendingRes, mineRes] = await Promise.all([
        reviewService.getReviewableViewings().catch(() => []),
        reviewService.getReviews({ perPage: 20 }).catch(
          () => ({ data: [], pagination: { total: 0, per_page: 0, current_page: 1, last_page: 1, from: 0, to: 0 } } as ReviewsResponse)
        ),
      ])
      setPending(pendingRes)
      setMine(mineRes.data)
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : t("error")
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (debouncedTab === "pending") {
      void reviewService
        .getReviewableViewings()
        .then(setPending)
        .catch(() => setPending([]))
    } else {
      void reviewService
        .getReviews({ perPage: 20 })
        .then((res) => setMine(res.data))
        .catch(() => setMine([]))
    }
  }, [debouncedTab])

  const handleRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const isLoadingPending = loading && pending.length === 0 && tab === "pending"
  const isLoadingMine = loading && mine.length === 0 && tab === "mine"

  return (
    <DashboardLayout
      title={t("title")}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {tCommon("retry")}
        </Button>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("myReviews")}</p>
        </div>

        <div className="flex gap-1 rounded-lg border bg-card p-1">
          <TabButton
            label={t("pending")}
            count={pending.length}
            active={tab === "pending"}
            onClick={() => setTab("pending")}
          />
          <TabButton
            label={t("myReviews")}
            count={mine.length}
            active={tab === "mine"}
            onClick={() => setTab("mine")}
          />
        </div>

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {tab === "pending" ? (
          isLoadingPending ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-12 text-center text-sm text-muted-foreground">
                <MessageSquare className="size-7" aria-hidden />
                <p className="font-medium">{t("noPending")}</p>
                <p className="text-xs">{t("noPendingHint")}</p>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-3">
              {pending.map((item) => (
                <li key={item.viewing_id}>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Building2 className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.property_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("reviewOf", { property: item.publisher_name })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setActiveViewing(item)}
                        className="rounded-lg"
                      >
                        {t("write")}
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )
        ) : isLoadingMine ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : mine.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center text-sm text-muted-foreground">
              <Sparkles className="size-7" aria-hidden />
              <p className="font-medium">{t("noMine")}</p>
              <p className="text-xs">{t("noMineHint")}</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {mine.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} onChanged={load} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeViewing && (
        <SubmitReviewDialog
          open={true}
          onOpenChange={(open) => !open && setActiveViewing(null)}
          viewingId={activeViewing.viewing_id}
          propertyTitle={activeViewing.property_title}
          onSuccess={load}
        />
      )}
    </DashboardLayout>
  )
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
      aria-pressed={active}
    >
      {label}
      <span
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  )
}
