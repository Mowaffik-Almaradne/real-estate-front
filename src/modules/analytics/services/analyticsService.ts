import { apiClient, getApiData, ApiClientError } from "@/lib/apiClient"
import type {
  AnalyticsSummary,
  AnalyticsSummaryResponse,
  AnalyticsRange,
} from "../types"

export { ApiClientError as AnalyticsServiceError }

type UnwrapInput<T> = T | { data: T } | null | undefined

function unwrap<T>(value: UnwrapInput<T>): T | null {
  if (!value) return null
  if (typeof value === "object" && "data" in value) {
    return (value as { data: T }).data
  }
  return value
}

export const analyticsService = {
  async getOwnerSummary(
    range: AnalyticsRange = "30d",
    propertyId?: number
  ): Promise<AnalyticsSummary | null> {
    const params: Record<string, string | number> = { range }
    if (propertyId != null) params.property_id = propertyId
    const response = await apiClient.get<
      AnalyticsSummaryResponse | AnalyticsSummary
    >("/analytics/owner/summary", { params })
    const data = getApiData(response) as
      | AnalyticsSummaryResponse
      | AnalyticsSummary
      | null
    if (!data) return null
    return unwrap(data)
  },
}