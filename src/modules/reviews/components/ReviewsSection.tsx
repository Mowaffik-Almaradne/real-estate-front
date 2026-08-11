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
  propertyId: number
  initialAverage?: number | null
  initialCount?: number | null
  canReview?: boolean
  onRequestReview?: () => void
  className?: string
}

export function ReviewsSection({
  propertyId,
  initialAverage,
  initialCount,
  className,
}: ReviewsSectionProps) {
  const t = useTranslations("reviews")
  const [reviews, setReviews] = useState<ReviewDto[]>([])
  const [loading, setLoading] = useState(true)
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
    let active = true
    void (async () => {
      setLoading(true)
      try {
        const result = await reviewService.getPropertyReviews(propertyId, {
          sort_by: sortBy,
          sort_order: sortOrder,
          perPage: 10,
        })
        if (!active) return
        setReviews(result.data)
        const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        for (const review of result.data) {
          const rounded = Math.max(1, Math.min(5, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5
          counts[rounded]++
        }
        setBreakdown(counts)
        setError(null)
      } catch (err) {
        if (!active) return
        const message = err instanceof ApiClientError ? err.message : t("error")
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [propertyId, sortBy, sortOrder, t])

  const avg = initialAverage ?? 0
  const total = initialCount ?? reviews.length

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-5 text-primary" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {total > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{avg.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
              <RatingStars value={avg} size="md" />
              <p className="text-xs text-muted-foreground">
                {t("basedOn", { count: total })}
              </p>
            </div>
            <RatingDistribution breakdown={breakdown} total={total} />
          </div>
        )}

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

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {loading && reviews.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noReviews")}</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        )}
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
