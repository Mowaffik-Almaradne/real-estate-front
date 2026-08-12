"use client"

import { MessageSquare } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { RatingStars } from "src/modules/reviews/components/RatingStars"
import { VerifiedBadge } from "src/modules/auth"
import { cn } from "@/lib/utils"
import { useAuth } from "src/context/AuthContext"
import type { PublisherProfileDto } from "@/types/publisher"

export interface PublisherHeroProps {
  publisher: PublisherProfileDto
  onContact?: () => void
  className?: string
}

export function PublisherHero({ publisher, onContact, className }: PublisherHeroProps) {
  const t = useTranslations("publisher")
  const { user } = useAuth()
  const isMe = user?.id === publisher.id

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="h-24 bg-gradient-to-br from-primary/20 via-accent/30 to-primary/10" />
      <CardContent className="-mt-12 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
            <div className="relative size-24 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md">
              {publisher.avatar_url ? (
                <Image
                  src={publisher.avatar_url}
                  alt={publisher.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                  {publisher.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-1 sm:pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{publisher.name}</h1>
                {publisher.is_verified && <VerifiedBadge verified={true} />}
              </div>
              <p className="text-sm text-muted-foreground">
                {t(`type.${publisher.publisher_type}`)}
                {publisher.employees_count && publisher.employees_count > 0 && (
                  <>
                    {" · "}
                    {t("employees", { count: publisher.employees_count })}
                  </>
                )}
              </p>
              {publisher.average_rating !== null && publisher.reviews_count > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <RatingStars value={publisher.average_rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {t("ratingSummary", {
                      value: publisher.average_rating.toFixed(1),
                      count: publisher.reviews_count,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
          {!isMe && onContact && (
            <Button onClick={onContact} className="rounded-lg sm:self-end">
              <MessageSquare className="size-4 me-2" />
              {t("contact")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}