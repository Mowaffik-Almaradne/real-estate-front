"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Loader2, MessageSquare } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { reviewService } from "@/services/review-service"
import type { ReviewDto, ReviewFilters } from "@/types/review"
import { RatingStars } from "./RatingStars"
import { RatingDistribution } from "./RatingDistribution"
import { ReviewCard } from "./ReviewCard"
import { ApiClientError } from "@/lib/apiClient"

export interface ReviewsSectionProps {
  /** Optional filter when a review list is available. */
  propertyId?: number
  /**
   * OpenAPI only lists reviews at GET /api/dashboard/offices/{officeId}/reviews.
   * That route is dashboard-permissioned (403 for normal consumers), so public
   * pages should leave `loadList` false and rely on rating summary fields.
   */
  officeId?: number | null
  /** When true, attempt the dashboard office reviews list (may 403). Default false. */
  loadList?: boolean
  initialAverage?: number | string | null
  initialCount?: number | string | null
  canReview?: boolean
  onRequestReview?: () => void
  className?: string
}

export function ReviewsSection({
  propertyId,
  officeId,
  loadList = false,
  initialAverage,
  initialCount,
  className,
}: ReviewsSectionProps) {
  const t = useTranslations("reviews")
  const [reviews, setReviews] = useState<ReviewDto[]>([])
  const [loading, setLoading] = useState(Boolean(loadList && officeId))
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<ReviewFilters["sort_by"]>("created_at")
  const [sortOrder, setSortOrder] = useState<ReviewFilters["sort_order"]>("desc")
  const [breakdown, setBreakdown] = useState<Record<1 | 2 | 3 | 4 | 5, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  })

  useEffect(() => {
    if (!loadList || !officeId) {
      setLoading(false)
      setReviews([])
      setError(null)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const result = await reviewService.getOfficeReviews(officeId, {
          sort_by: sortBy,
          sort_order: sortOrder,
          perPage: 10,
        })
        if (!active) return
        let list = Array.isArray(result.data) ? result.data : []
        if (propertyId && propertyId > 0) {
          list = list.filter((review) => !review.property_id || review.property_id === propertyId)
        }
        setReviews(list)
        const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        for (const review of list) {
          const rounded = Math.max(1, Math.min(5, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5
          counts[rounded]++
        }
        setBreakdown(counts)
        setError(null)
      } catch (err) {
        if (!active) return
        if (
          err instanceof ApiClientError &&
          (err.isNotFound() || err.isUnauthorized() || err.isForbidden())
        ) {
          setReviews([])
          setError(null)
        } else {
          setError(err instanceof ApiClientError ? err.message : t("error"))
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [loadList, officeId, propertyId, sortBy, sortOrder, t])

  const avg = Number(initialAverage ?? 0) || 0
  const reportedCount = Number(initialCount ?? 0) || 0
  const total = reportedCount || reviews.length
  const showSummary = avg > 0 || total > 0

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-5 text-primary" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {showSummary && (
          <div className={`grid gap-4 ${reviews.length > 0 ? "sm:grid-cols-2" : ""}`}>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{avg.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
              <RatingStars value={avg} size="md" />
              {total > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("basedOn", { count: total })}
                </p>
              )}
            </div>
            {reviews.length > 0 && (
              <RatingDistribution breakdown={breakdown} total={total || reviews.length} />
            )}
          </div>
        )}

        {loadList && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {t("showAll", { count: total })}
            </p>
            <div className="inline-flex items-center gap-1 rounded-md border p-0.5">
              <SortButton
                label={t("sort.newest")}
                active={sortBy === "created_at" && sortOrder === "desc"}
                onClick={() => {
                  setSortBy("created_at")
                  setSortOrder("desc")
                }}
              />
              <SortButton
                label={t("sort.highest")}
                active={sortBy === "rating" && sortOrder === "desc"}
                onClick={() => {
                  setSortBy("rating")
                  setSortOrder("desc")
                }}
              />
              <SortButton
                label={t("sort.lowest")}
                active={sortBy === "rating" && sortOrder === "asc"}
                onClick={() => {
                  setSortBy("rating")
                  setSortOrder("asc")
                }}
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {loadList && loading && reviews.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : loadList && reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noReviews")}</p>
        ) : reviews.length > 0 ? (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        ) : !showSummary ? (
          <p className="text-sm text-muted-foreground">{t("noReviews")}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "ghost"}
      onClick={onClick}
      className="h-7 px-2 text-xs"
    >
      {active && <Loader2 className="size-3 animate-spin me-1" aria-hidden />}
      {label}
    </Button>
  )
}
