export const ANALYTICS_RANGES = ["7d", "30d", "90d", "12m"] as const
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number]

export const DEFAULT_ANALYTICS_RANGE: AnalyticsRange = "30d"

export const ANALYTICS_METRICS = [
  "views",
  "contacts",
  "favorites",
  "viewings",
  "conversion_rate",
] as const
export type AnalyticsMetric = (typeof ANALYTICS_METRICS)[number]

export interface TimeSeriesPoint {
  readonly date: string
  readonly value: number
}

export interface MetricSeries {
  readonly metric: AnalyticsMetric
  readonly total: number
  readonly previous_total: number
  readonly points: readonly TimeSeriesPoint[]
}

export interface PropertyAnalytics {
  readonly id: number
  readonly title: string
  readonly views: number
  readonly contacts: number
  readonly favorites: number
  readonly viewings: number
  readonly status: string
}

export interface AnalyticsSummary {
  readonly range: AnalyticsRange
  readonly from: string
  readonly to: string
  readonly total_views: number
  readonly total_contacts: number
  readonly total_favorites: number
  readonly total_viewings: number
  readonly total_conversions: number
  readonly conversion_rate: number
  readonly views_change: number
  readonly contacts_change: number
  readonly favorites_change: number
  readonly viewings_change: number
  readonly series: readonly MetricSeries[]
  readonly top_properties: readonly PropertyAnalytics[]
}

export interface AnalyticsSummaryResponse {
  readonly data: AnalyticsSummary
}

export type ChangeDirection = "up" | "down" | "flat"

export function classifyChange(change: number): ChangeDirection {
  if (change > 0.5) return "up"
  if (change < -0.5) return "down"
  return "flat"
}

export function formatRangeDays(range: AnalyticsRange): number {
  switch (range) {
    case "7d":
      return 7
    case "30d":
      return 30
    case "90d":
      return 90
    case "12m":
      return 365
  }
}