import {
  apiClient,
  ApiClientError,
  getApiData,
  getApiPagination,
  type ApiResponse,
} from "@/lib/apiClient"
import type {
  AdGroupDto,
  AdGroupFilters,
  AdGroupsResponse,
  CreateAdGroupRequest,
  SetAdGroupDefaultRequest,
  UpdateAdGroupRequest,
} from "../types"

export { ApiClientError as AdGroupServiceError }

function buildListParams(filters: AdGroupFilters = {}): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.page != null) params.page = String(filters.page)
  if (filters.perPage != null) params.perPage = String(filters.perPage)
  if (filters.sort_by) params.sort_by = filters.sort_by
  if (filters.sort_order) params.sort_order = filters.sort_order
  return params
}

function withFallbackPagination(
  response: { data: { pagination?: ApiResponse<unknown>["pagination"] } },
  filters: AdGroupFilters,
  items: AdGroupDto[]
): AdGroupsResponse {
  const pagination = getApiPagination(response as never) ??
    response.data.pagination ?? {
      total: items.length,
      per_page: filters.perPage ?? items.length,
      current_page: filters.page ?? 1,
      last_page: 1,
      from: items.length ? 1 : null,
      to: items.length || null,
    }
  return { data: items, pagination }
}

export const adGroupService = {
  /**
   * List ad groups owned by / visible to the authenticated user.
   * `GET /api/dashboard/ad-groups`.
   */
  async list(filters: AdGroupFilters = {}): Promise<AdGroupsResponse> {
    const response = await apiClient.get<ApiResponse<AdGroupDto[]>>(
      "/dashboard/ad-groups",
      { params: buildListParams(filters) }
    )
    const data = getApiData(response) ?? []
    return withFallbackPagination(response as never, filters, data)
  },

  /**
   * Fetch a single ad group. `GET /api/dashboard/ad-groups/{id}` is not
   * documented; fall back to listing when the per-id route is unavailable.
   */
  async getById(id: number): Promise<AdGroupDto> {
    try {
      const response = await apiClient.get<ApiResponse<AdGroupDto>>(
        `/dashboard/ad-groups/${id}`
      )
      return getApiData(response)
    } catch (err) {
      const listResponse = await apiClient.get<ApiResponse<AdGroupDto[]>>(
        "/dashboard/ad-groups",
        { params: { perPage: 100 } }
      )
      const items = getApiData(listResponse) ?? []
      const found = items.find((item) => item.id === id)
      if (found) return found
      throw err
    }
  },

  /**
   * Create a new ad group. `POST /api/dashboard/ad-groups`.
   */
  async create(payload: CreateAdGroupRequest): Promise<AdGroupDto> {
    const response = await apiClient.post<ApiResponse<AdGroupDto>>(
      "/dashboard/ad-groups",
      payload
    )
    return getApiData(response)
  },

  /**
   * Patch an existing ad group. `PATCH /api/dashboard/ad-groups/{id}`.
   */
  async update(id: number, payload: UpdateAdGroupRequest): Promise<AdGroupDto> {
    const response = await apiClient.patch<ApiResponse<AdGroupDto>>(
      `/dashboard/ad-groups/${id}`,
      payload
    )
    return getApiData(response)
  },

  /**
   * Archive a group. The backend uses `DELETE /api/dashboard/ad-groups/{id}`
   * which sets `is_archived=true` (per application-scenarios §6.1).
   */
  async archive(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/ad-groups/${id}`)
  },

  /**
   * Restore an archived group. `POST /api/dashboard/ad-groups/{id}/restore`.
   */
  async restore(id: number): Promise<AdGroupDto> {
    const response = await apiClient.post<ApiResponse<AdGroupDto>>(
      `/dashboard/ad-groups/${id}/restore`
    )
    return getApiData(response)
  },

  /**
   * Set the default ad for a group. `POST /api/dashboard/ad-groups/{id}/set-default`.
   */
  async setDefault(id: number, payload: SetAdGroupDefaultRequest): Promise<AdGroupDto> {
    const response = await apiClient.post<ApiResponse<AdGroupDto>>(
      `/dashboard/ad-groups/${id}/set-default`,
      payload
    )
    return getApiData(response)
  },

  /**
   * Remove the default ad from a group. `DELETE /api/dashboard/ad-groups/{id}/default`.
   */
  async removeDefault(id: number): Promise<AdGroupDto> {
    const response = await apiClient.delete<ApiResponse<AdGroupDto>>(
      `/dashboard/ad-groups/${id}/default`
    )
    return getApiData(response)
  },
}
