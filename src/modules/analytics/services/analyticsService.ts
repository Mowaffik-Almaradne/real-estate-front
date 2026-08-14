import {
  apiClient,
  getApiData,
  ApiClientError,
  type ApiResponse,
} from "@/lib/apiClient"
import type {
  AnalyticsSummary,
  AnalyticsSummaryResponse,
  AnalyticsRange,
  AnalyticsMetric,
  MetricSeries,
  PropertyAnalytics,
  TimeSeriesPoint,
} from "../types"
import { formatRangeDays } from "../types"

export { ApiClientError as AnalyticsServiceError }

type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord
  }
  return null
}

function num(...values: unknown[]): number {
  for (const value of values) {
    if (value == null || value === "") continue
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return 0
}

function str(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value
  }
  return ""
}

function bool(...values: unknown[]): boolean {
  for (const value of values) {
    if (typeof value === "boolean") return value
    if (value === 1 || value === "1" || value === "true") return true
  }
  return false
}

function rangeWindow(range: AnalyticsRange): { from: string; to: string; days: number } {
  const days = formatRangeDays(range)
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - (days - 1))
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    days,
  }
}

function emptySeries(
  metric: AnalyticsMetric,
  total = 0,
  previous = 0,
  points: TimeSeriesPoint[] = []
): MetricSeries {
  return { metric, total, previous_total: previous, points }
}

function buildFlatSeries(
  metric: AnalyticsMetric,
  total: number,
  from: string,
  to: string
): MetricSeries {
  return emptySeries(metric, total, total, [
    { date: from, value: Math.max(0, Math.round(total * 0.7)) },
    { date: to, value: total },
  ])
}

function extractPoints(raw: unknown): TimeSeriesPoint[] {
  const record = asRecord(raw)
  const candidates: unknown[] = []
  if (Array.isArray(raw)) candidates.push(raw)
  if (record) {
    for (const key of ["points", "data", "views_by_day", "visits_by_day", "trend", "series", "items"]) {
      if (Array.isArray(record[key])) candidates.push(record[key])
    }
  }

  for (const list of candidates) {
    if (!Array.isArray(list) || list.length === 0) continue
    const points = list
      .map((item) => {
        const row = asRecord(item)
        if (!row) return null
        const date = str(row.date, row.day, row.label, row.period)
        const value = num(row.value, row.views, row.count, row.total, row.visits)
        if (!date) return null
        return { date, value }
      })
      .filter((p): p is TimeSeriesPoint => p != null)
    if (points.length > 0) return points
  }
  return []
}

function extractTopProperties(raw: unknown): PropertyAnalytics[] {
  const record = asRecord(raw)
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(record?.data)
      ? record.data
      : Array.isArray(record?.top_properties)
        ? record.top_properties
        : Array.isArray(record?.properties)
          ? record.properties
          : []

  return list
    .map((item) => {
      const row = asRecord(item)
      if (!row) return null
      const id = num(row.id, row.property_id)
      if (!id) return null
      return {
        id,
        title: str(row.title, row.name, row.property_title) || `Property #${id}`,
        views: num(row.views, row.total_views, row.views_count),
        contacts: num(row.contacts, row.leads, row.total_contacts),
        favorites: num(row.favorites, row.favorites_count, row.loves, row.total_favorites),
        viewings: num(row.viewings, row.appointments, row.total_viewings),
        status: str(row.status) || "approved",
      } satisfies PropertyAnalytics
    })
    .filter((p): p is PropertyAnalytics => p != null)
    .sort((a, b) => b.views - a.views)
}

function isAnalyticsSummary(value: unknown): value is AnalyticsSummary {
  const row = asRecord(value)
  return Boolean(row && ("total_views" in row || "series" in row || "top_properties" in row))
}

function normalizeSummary(raw: unknown, range: AnalyticsRange): AnalyticsSummary | null {
  if (!raw) return null
  const nested = asRecord(raw)
  const candidate =
    nested && isAnalyticsSummary(nested.data)
      ? nested.data
      : isAnalyticsSummary(raw)
        ? raw
        : nested
  const payload: UnknownRecord = asRecord(candidate) ?? {}
  if (!nested && !candidate) return null

  const keys = Object.keys(payload).filter((key) => key !== "data" || payload.data != null)
  if (keys.length === 0 || (keys.length === 1 && keys[0] === "data" && payload.data == null)) {
    return null
  }

  const window = rangeWindow(range)
  const from = str(payload.from) || window.from
  const to = str(payload.to) || window.to

  const totalViews = num(
    payload.total_views,
    payload.views,
    payload.property_views,
    asRecord(payload.kpis)?.views
  )
  const totalContacts = num(
    payload.total_contacts,
    payload.contacts,
    payload.leads,
    asRecord(payload.kpis)?.leads,
    asRecord(payload.kpis)?.contacts
  )
  const totalFavorites = num(
    payload.total_favorites,
    payload.favorites,
    payload.loves,
    asRecord(payload.kpis)?.favorites
  )
  const totalViewings = num(
    payload.total_viewings,
    payload.viewings,
    payload.appointments,
    asRecord(payload.kpis)?.appointments,
    asRecord(payload.kpis)?.viewings
  )
  const totalConversions = num(payload.total_conversions, payload.conversions)
  const conversionRate = num(
    payload.conversion_rate,
    payload.ctr,
    totalViews > 0 ? (totalContacts / totalViews) * 100 : 0
  )

  const seriesRaw = Array.isArray(payload.series) ? payload.series : []
  const mappedSeries: MetricSeries[] = seriesRaw
    .map((item): MetricSeries | null => {
      const row = asRecord(item)
      if (!row) return null
      const metric = str(row.metric) as AnalyticsMetric
      if (!metric) return null
      return {
        metric,
        total: num(row.total, row.value),
        previous_total: num(row.previous_total, row.previous),
        points: extractPoints(row.points ?? row),
      }
    })
    .filter((s): s is MetricSeries => s != null)

  const hasMetricSignals =
    totalViews > 0 ||
    totalContacts > 0 ||
    totalFavorites > 0 ||
    totalViewings > 0 ||
    mappedSeries.length > 0 ||
    "total_views" in payload ||
    "views" in payload ||
    "series" in payload ||
    "top_properties" in payload

  if (!hasMetricSignals) return null

  const ensure = (metric: AnalyticsMetric, total: number) => {
    const existing = mappedSeries.find((s) => s.metric === metric)
    if (existing) return existing
    return buildFlatSeries(metric, total, from, to)
  }

  const series =
    mappedSeries.length > 0
      ? mappedSeries
      : [
          ensure("views", totalViews),
          ensure("contacts", totalContacts),
          ensure("favorites", totalFavorites),
          ensure("viewings", totalViewings),
        ]

  return {
    range,
    from,
    to,
    total_views: totalViews,
    total_contacts: totalContacts,
    total_favorites: totalFavorites,
    total_viewings: totalViewings,
    total_conversions: totalConversions,
    conversion_rate: conversionRate,
    views_change: num(payload.views_change, payload.views_delta),
    contacts_change: num(payload.contacts_change, payload.leads_change),
    favorites_change: num(payload.favorites_change),
    viewings_change: num(payload.viewings_change, payload.appointments_change),
    series,
    top_properties: extractTopProperties(
      payload.top_properties ?? payload.properties ?? payload.top_performing
    ),
    source: "advanced",
  }
}

function summaryFromBasicSources(
  range: AnalyticsRange,
  statistics: unknown,
  myProperties: unknown
): AnalyticsSummary | null {
  const window = rangeWindow(range)
  const stats = asRecord(statistics) ?? {}
  const top = extractTopProperties(myProperties).slice(0, 8)

  const totalViews = num(
    stats.total_views,
    stats.views,
    stats.property_views,
    top.reduce((sum, p) => sum + p.views, 0)
  )
  const totalFavorites = num(
    stats.total_favorites,
    stats.favorites,
    stats.loves,
    top.reduce((sum, p) => sum + p.favorites, 0)
  )
  const totalContacts = num(stats.total_contacts, stats.contacts, stats.leads)
  const totalViewings = num(stats.total_viewings, stats.viewings, stats.appointments)
  const listings = num(stats.all, stats.total_properties, stats.properties_count, top.length)

  const hasAny =
    totalViews > 0 ||
    totalFavorites > 0 ||
    totalContacts > 0 ||
    totalViewings > 0 ||
    listings > 0 ||
    top.length > 0 ||
    Object.keys(stats).length > 0

  if (!hasAny) return null

  return {
    range,
    from: window.from,
    to: window.to,
    total_views: totalViews,
    total_contacts: totalContacts,
    total_favorites: totalFavorites,
    total_viewings: totalViewings,
    total_conversions: 0,
    conversion_rate:
      totalViews > 0 ? Number(((totalContacts / totalViews) * 100).toFixed(1)) : 0,
    views_change: 0,
    contacts_change: 0,
    favorites_change: 0,
    viewings_change: 0,
    series: [
      buildFlatSeries("views", totalViews, window.from, window.to),
      buildFlatSeries("contacts", totalContacts, window.from, window.to),
      buildFlatSeries("favorites", totalFavorites, window.from, window.to),
      buildFlatSeries("viewings", totalViewings, window.from, window.to),
    ],
    top_properties: top,
    source: "basic",
  }
}

async function silentGet<T>(url: string, params?: Record<string, string | number>) {
  try {
    const response = await apiClient.get<ApiResponse<T> | T>(url, {
      params,
      silent: true,
    })
    return getApiData(response as never) as T
  } catch (error) {
    if (
      error instanceof ApiClientError &&
      (error.isNotFound() || error.isForbidden() || error.isUnauthorized())
    ) {
      return null
    }
    throw error
  }
}

async function hasAdvancedAnalyticsFeature(): Promise<boolean> {
  const data = await silentGet<UnknownRecord>("/subscription/features/advanced_analytics")
  if (!data) return false
  const row = asRecord(data) ?? {}
  const nested = asRecord(row.data) ?? row
  return bool(
    nested.enabled,
    nested.has_access,
    nested.allowed,
    nested.is_enabled,
    nested.access,
    nested.available
  )
}

/**
 * OpenAPI (`docs/openapi.yaml`) publisher analytics:
 * - GET /api/publisher/statistics — basic stats (views, favorites, counts)
 * - GET /api/publisher/analytics — detailed (requires advanced_analytics plan feature)
 * - GET /api/subscription/features/{slug} — feature gate check
 * - GET /api/dashboard/my-properties — listing-level views for top properties
 *
 * Do NOT call /dashboard/trader/* here — those are trader-role routes and 403 for normal publishers.
 */
export const analyticsService = {
  async getOwnerSummary(
    range: AnalyticsRange = "30d",
    propertyId?: number
  ): Promise<AnalyticsSummary | null> {
    const params: Record<string, string | number> = { range }
    if (propertyId != null) params.property_id = propertyId

    const canUseAdvanced = await hasAdvancedAnalyticsFeature()

    if (canUseAdvanced) {
      const analytics = await silentGet<AnalyticsSummaryResponse | AnalyticsSummary | UnknownRecord>(
        "/publisher/analytics",
        params
      )
      const normalized = normalizeSummary(analytics, range)
      if (normalized) return normalized
    }

    const [statistics, myProperties] = await Promise.all([
      silentGet<UnknownRecord>("/publisher/statistics"),
      silentGet<UnknownRecord>("/dashboard/my-properties", { perPage: 50 }),
    ])

    return summaryFromBasicSources(range, statistics, myProperties)
  },
}
