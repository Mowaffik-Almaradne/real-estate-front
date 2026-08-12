"use client"

import { useState } from "react"
import { Loader2, MessageSquare } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Textarea } from "components/ui/textarea"
import { Switch } from "components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"
import { reviewService } from "@/services/review-service"
import { RatingInput } from "./RatingInput"
import { ApiClientError } from "@/lib/apiClient"

export interface SubmitReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  viewingId: number
  propertyTitle: string
  initialRating?: number
  initialTitle?: string | null
  initialBody?: string | null
  initialAnonymous?: boolean
  reviewId?: number
  mode?: "create" | "edit"
  onSuccess?: () => void
}

const TITLE_MAX = 100
const BODY_MAX = 1000

export function SubmitReviewDialog({
  open,
  onOpenChange,
  viewingId,
  propertyTitle,
  initialRating = 0,
  initialTitle = "",
  initialBody = "",
  initialAnonymous = false,
  reviewId,
  mode = "create",
  onSuccess,
}: SubmitReviewDialogProps) {
  const t = useTranslations("reviews")
  const tCommon = useTranslations("common")
  const [rating, setRating] = useState(initialRating)
  const [title, setTitle] = useState(initialTitle ?? "")
  const [body, setBody] = useState(initialBody ?? "")
  const [anonymous, setAnonymous] = useState(initialAnonymous)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (rating < 1) {
      toast.error(t("ratingRequired"))
      return
    }
    setSubmitting(true)
    try {
      if (mode === "edit" && reviewId) {
        await reviewService.updateReview(reviewId, {
          rating,
          title: title || null,
          body: body || null,
          is_anonymous: anonymous,
        })
        toast.success(t("updated"))
      } else {
        await reviewService.createReview({
          viewing_id: viewingId,
          rating,
          title: title || null,
          body: body || null,
          is_anonymous: anonymous,
        })
        toast.success(t("submitted"))
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : tCommon("error")
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            {mode === "edit" ? t("edit") : t("write")}
          </DialogTitle>
          <DialogDescription>{propertyTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("ratingLabel")}</Label>
            <RatingInput value={rating} onChange={setRating} size="lg" />
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">{t("ratingHint")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-title">{t("titleLabel")}</Label>
            <Input
              id="review-title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
            />
            <p className="text-xs text-muted-foreground text-end">
              {title.length}/{TITLE_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-body">{t("bodyLabel")}</Label>
            <Textarea
              id="review-body"
              value={body}
              maxLength={BODY_MAX}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("bodyPlaceholder")}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-end">
              {body.length}/{BODY_MAX}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{t("anonymous")}</p>
              <p className="text-xs text-muted-foreground">{t("anonymousHint")}</p>
            </div>
            <Switch
              checked={anonymous}
              onCheckedChange={setAnonymous}
              aria-label={t("anonymous")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating < 1}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "edit" ? t("save") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
