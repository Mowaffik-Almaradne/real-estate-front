"use client"

import { Building2, Calendar, Star, Users } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PublisherProfileDto } from "@/types/publisher"

export interface PublisherStatsGridProps {
  publisher: PublisherProfileDto
  className?: string
}

export function PublisherStatsGrid({ publisher, className }: PublisherStatsGridProps) {
  const t = useTranslations("publisher.stats")
  const memberSince = new Date(publisher.created_at).getUTCFullYear().toString()

  const stats = [
    {
      icon: Building2,
      label: t("properties"),
      value: publisher.properties_count,
    },
    {
      icon: Star,
      label: t("rating"),
      value:
        publisher.average_rating !== null ? publisher.average_rating.toFixed(1) : "—",
    },
    {
      icon: Users,
      label: t("reviews"),
      value: publisher.reviews_count,
    },
    {
      icon: Calendar,
      label: t("memberSince"),
      value: memberSince,
    },
  ]

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-xl bg-accent/30 p-3 text-center"
            >
              <Icon className="size-5 text-primary" aria-hidden />
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}