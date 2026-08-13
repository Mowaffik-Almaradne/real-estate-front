import {
  apiClient,
  ApiClientError,
  getApiData,
  type ApiResponse,
  type ApiPagination,
} from "@/lib/apiClient"
import type {
  CancelSubscriptionResponse,
  CurrentSubscription,
  SubscriptionFeatureLimit,
  SubscriptionHistoryItem,
  SubscriptionHistoryResponse,
  SubscriptionStatusLog,
  SubscriptionStatusLogsResponse,
} from "./types"

export { ApiClientError as SubscriptionLifecycleServiceError }

const EMPTY_PAGINATION: ApiPagination = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 1,
  from: null,
  to: null,
}

function resolveArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function paginationFor<T>(items: T[]): ApiPagination {
  return {
    ...EMPTY_PAGINATION,
    total: items.length,
    per_page: items.length,
    current_page: 1,
    last_page: 1,
    from: items.length ? 1 : null,
    to: items.length || null,
  }
}

/**
 * Subscription lifecycle endpoints (current, history, cancel, features,
 * feature check, status logs).
 */
export const subscriptionLifecycleService = {
  async getCurrent(): Promise<CurrentSubscription | null> {
    const response = await apiClient.get<ApiResponse<CurrentSubscription | null>>(
      "/subscription/current",
      { silent: true }
    )
    const data = getApiData(response)
    return (data as CurrentSubscription | null) ?? null
  },

  async getHistory(): Promise<SubscriptionHistoryItem[]> {
    const response = await apiClient.get<
      ApiResponse<SubscriptionHistoryItem[]>
    >("/subscription/history", { silent: true })
    const data = getApiData(response)
    return resolveArray<SubscriptionHistoryItem>(data)
  },

  async cancel(): Promise<CancelSubscriptionResponse> {
    const response = await apiClient.post<ApiResponse<CancelSubscriptionResponse>>(
      "/subscription/cancel",
      {}
    )
    return getApiData(response)
  },

  async getFeatures(): Promise<SubscriptionFeatureLimit[]> {
    const response = await apiClient.get<
      ApiResponse<SubscriptionFeatureLimit[]>
    >("/subscription/features", { silent: true })
    const data = getApiData(response)
    return resolveArray<SubscriptionFeatureLimit>(data)
  },

  async checkFeature(slug: string): Promise<SubscriptionFeatureLimit | null> {
    const response = await apiClient.get<
      ApiResponse<SubscriptionFeatureLimit | null>
    >(`/subscription/features/${encodeURIComponent(slug)}`, {
      silent: true,
    })
    const data = getApiData(response)
    return (data as SubscriptionFeatureLimit | null) ?? null
  },

  async getStatusLogs(
    subscriptionId: number
  ): Promise<SubscriptionStatusLog[]> {
    const response = await apiClient.get<ApiResponse<SubscriptionStatusLog[]>>(
      `/subscription/${subscriptionId}/status-logs`,
      { silent: true }
    )
    const data = getApiData(response)
    return resolveArray<SubscriptionStatusLog>(data)
  },
}

export function buildHistoryResponse(
  items: SubscriptionHistoryItem[]
): SubscriptionHistoryResponse {
  return { data: items, pagination: paginationFor(items) }
}

export function buildStatusLogsResponse(
  items: SubscriptionStatusLog[]
): SubscriptionStatusLogsResponse {
  return { data: items, pagination: paginationFor(items) }
}
