"use client"

import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { ComponentType } from "react"

import { Card, CardContent } from "components/ui/card"
import { cn } from "@/lib/utils"

import { classifyChange, type ChangeDirection } from "../types"

interface AnalyticsKpiCardProps {
  title: string
  value: number
  changePercent: number
  icon?: ComponentType<{ className?: string }>
  description?: string
  testId?: string
}

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function formatChange(change: number, locale: string): string {
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    signDisplay: "always",
  }).format(change)
  return `${formatted}%`
}

export function AnalyticsKpiCard({
  title,
  value,
  changePercent,
  icon: Icon,
  description,
  testId,
}: AnalyticsKpiCardProps) {
  const t = useTranslations("analytics")
  const locale = useLocale()
  const direction: ChangeDirection = classifyChange(changePercent)

  const trendColor =
    direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : direction === "down"
        ? "text-destructive"
        : "text-muted-foreground"

  const TrendIcon =
    direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus

  return (
    <Card data-testid={testId} className="relative overflow-hidden">
      <CardContent className="space-y-2 p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <span className="rounded-full bg-primary/10 p-2 text-primary">
              <Icon className="size-4" aria-hidden />
            </span>
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight">{formatNumber(value, locale)}</p>
        <div className="flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center gap-1 font-medium", trendColor)}>
            <TrendIcon className="size-3" aria-hidden />
            {formatChange(changePercent, locale)}
          </span>
          <span className="text-muted-foreground">{t("vsPrevious")}</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}