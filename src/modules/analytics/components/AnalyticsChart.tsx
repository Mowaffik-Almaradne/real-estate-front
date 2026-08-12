"use client"

import { useId, useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import type { AnalyticsMetric, TimeSeriesPoint } from "../types"

interface AnalyticsChartProps {
  metric: AnalyticsMetric
  points: readonly TimeSeriesPoint[]
  height?: number
  className?: string
}

const VIEW_WIDTH = 320
const PADDING_X = 4
const PADDING_Y = 12

function buildPath(values: number[], width: number, height: number): string {
  if (values.length === 0) return ""
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = (width - PADDING_X * 2) / Math.max(values.length - 1, 1)
  return values
    .map((v, i) => {
      const x = PADDING_X + i * stepX
      const y = height - PADDING_Y - ((v - min) / range) * (height - PADDING_Y * 2)
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
}

function buildAreaPath(values: number[], width: number, height: number, linePath: string): string {
  if (!linePath) return ""
  const stepX = (width - PADDING_X * 2) / Math.max(values.length - 1, 1)
  const lastX = PADDING_X + (values.length - 1) * stepX
  return `${linePath} L${lastX.toFixed(1)},${(height - PADDING_Y).toFixed(1)} L${PADDING_X.toFixed(1)},${(height - PADDING_Y).toFixed(1)} Z`
}

export function AnalyticsChart({
  metric,
  points,
  height = 160,
  className,
}: AnalyticsChartProps) {
  const t = useTranslations("analytics")
  const locale = useLocale()
  const id = useId()
  const gradientId = `analytics-gradient-${id}`

  const values = useMemo(() => points.map((p) => p.value), [points])
  const total = useMemo(() => values.reduce((sum, v) => sum + v, 0), [values])
  const path = useMemo(() => buildPath(values, VIEW_WIDTH, height), [values, height])
  const areaPath = useMemo(
    () => buildAreaPath(values, VIEW_WIDTH, height, path),
    [values, height, path]
  )

  if (points.length === 0) {
    return (
      <div
        className={cn(
          "flex h-32 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground",
          className
        )}
      >
        {t("noData")}
      </div>
    )
  }

  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  })

  return (
    <div className={cn("space-y-2", className)} data-testid={`analytics-chart-${metric}`}>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {t(`metrics.${metric}`)}
        </p>
        <p className="text-lg font-semibold tabular-nums">
          {new Intl.NumberFormat(locale).format(total)}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
        preserveAspectRatio="none"
        className="h-32 w-full"
        role="img"
        aria-label={`${t(`metrics.${metric}`)} over time`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
          className="text-primary"
        />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
      </svg>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{dateFormatter.format(new Date(firstPoint.date))}</span>
        <span>{dateFormatter.format(new Date(lastPoint.date))}</span>
      </div>
    </div>
  )
}