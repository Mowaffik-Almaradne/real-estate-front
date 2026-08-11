"use client"

import { useState } from "react"
import { Edit2, MessageSquare, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { useAuth } from "src/context/AuthContext"
import { reviewService } from "@/services/review-service"
import { RatingStars } from "./RatingStars"
import { SubmitReviewDialog } from "./SubmitReviewDialog"
import { ApiClientError } from "@/lib/apiClient"
import type { ReviewDto } from "@/types/review"
import { cn } from "@/lib/utils"

export interface ReviewCardProps {
  review: ReviewDto
  onChanged?: () => void
  className?: string
}

export function ReviewCard({ review, onChanged, className }: ReviewCardProps) {
  const t = useTranslations("reviews")
  const tCommon = useTranslations("common")
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isMine = user?.id === review.reviewer?.id
  const visibleName = review.is_anonymous
    ? t("anonymous")
    : review.reviewer?.name ?? t("anonymous")

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    try {
      await reviewService.deleteReview(review.id)
      toast.success(t("deleted"))
      onChanged?.()
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : tCommon("error")
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-4 space-y-3",
        className
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {visibleName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{visibleName}</p>
            <div className="flex items-center gap-2">
              <RatingStars value={review.rating} size="xs" />
              <time
                dateTime={review.created_at}
                className="text-xs text-muted-foreground"
              >
                {new Date(review.created_at).toLocaleDateString()}
              </time>
            </div>
          </div>
        </div>
        {isMine && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditing(true)}
              aria-label={t("edit")}
            >
              <Edit2 className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              disabled={deleting}
              aria-label={t("delete")}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </header>

      {review.title && (
        <p className="text-sm font-semibold">{review.title}</p>
      )}
      {review.body && (
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {review.body}
        </p>
      )}

      {!review.title && !review.body && (
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="size-3" />
          {t("noContent")}
        </p>
      )}

      {isMine && (
        <SubmitReviewDialog
          open={editing}
          onOpenChange={setEditing}
          viewingId={0}
          propertyTitle={review.property_title ?? ""}
          initialRating={review.rating}
          initialTitle={review.title}
          initialBody={review.body}
          initialAnonymous={review.is_anonymous}
          reviewId={review.id}
          mode="edit"
          onSuccess={onChanged}
        />
      )}
    </article>
  )
}
