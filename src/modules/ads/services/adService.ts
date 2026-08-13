import {
  apiClient,
  ApiClientError,
  getApiData,
  getApiPagination,
  type ApiResponse,
} from "@/lib/apiClient"
import type {
  AdDto,
  AdFilters,
  AdsResponse,
  CreateAdRequest,
  LinkAdPropertyRequest,
  SetAdStatusRequest,
  UpdateAdRequest,
} from "../types"

export { ApiClientError as AdServiceError }

function buildListParams(filters: AdFilters = {}): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.ad_group_id != null)
    params.ad_group_id = String(filters.ad_group_id)
  if (filters.page != null) params.page = String(filters.page)
  if (filters.perPage != null) params.perPage = String(filters.perPage)
  if (filters.sort_by) params.sort_by = filters.sort_by
  if (filters.sort_order) params.sort_order = filters.sort_order
  return params
}

function withFallbackPagination(
  response: { data: { pagination?: ApiResponse<unknown>["pagination"] } },
  filters: AdFilters,
  items: AdDto[]
): AdsResponse {
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

export const adService = {
  /**
   * List ads visible to the authenticated dashboard user.
   *
   * Hits `GET /api/dashboard/ads`. The OpenAPI spec only documents the
   * write-side endpoints, but the controller exposes the standard
   * Filterable index method (`GET /api/dashboard/ads?…`) returning the
   * shared `{ data, pagination }` envelope.
   */
  async list(filters: AdFilters = {}): Promise<AdsResponse> {
    const response = await apiClient.get<ApiResponse<AdDto[]>>("/dashboard/ads", {
      params: buildListParams(filters),
    })
    const data = getApiData(response) ?? []
    return withFallbackPagination(response as never, filters, data)
  },

  /**
   * Fetch a single ad by id from the dashboard endpoint.
   *
   * `GET /api/dashboard/ads/{id}` is not explicitly documented in OpenAPI
   * but mirrors the show endpoint for the related resources (ad-groups,
   * sponsored ads). Falls back to `GET /api/dashboard/ads` and locates the
   * ad when the per-id route is unavailable on the running backend.
   */
  async getById(id: number): Promise<AdDto> {
    try {
      const response = await apiClient.get<ApiResponse<AdDto>>(
        `/dashboard/ads/${id}`
      )
      return getApiData(response)
    } catch (err) {
      // The OpenAPI contract for ads only documents write endpoints; fall
      // back to listing so the detail page can still render ad metadata.
      const listResponse = await apiClient.get<ApiResponse<AdDto[]>>(
        "/dashboard/ads",
        { params: { perPage: 100 } }
      )
      const items = getApiData(listResponse) ?? []
      const found = items.find((item) => item.id === id)
      if (found) return found
      throw err
    }
  },

  /**
   * Create a new ad. `POST /api/dashboard/ads`.
   */
  async create(payload: CreateAdRequest): Promise<AdDto> {
    const response = await apiClient.post<ApiResponse<AdDto>>(
      "/dashboard/ads",
      payload
    )
    return getApiData(response)
  },

  /**
   * Patch an existing ad. `PATCH /api/dashboard/ads/{id}`.
   */
  async update(id: number, payload: UpdateAdRequest): Promise<AdDto> {
    const response = await apiClient.patch<ApiResponse<AdDto>>(
      `/dashboard/ads/${id}`,
      payload
    )
    return getApiData(response)
  },

  /**
   * Archive an ad. `DELETE /api/dashboard/ads/{id}`.
   */
  async archive(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/ads/${id}`)
  },

  /**
   * Restore an archived ad. `POST /api/dashboard/ads/{id}/restore`.
   */
  async restore(id: number): Promise<AdDto> {
    const response = await apiClient.post<ApiResponse<AdDto>>(
      `/dashboard/ads/${id}/restore`
    )
    return getApiData(response)
  },

  /**
   * Update only the ad status. `POST /api/dashboard/ads/{id}/status`.
   */
  async setStatus(id: number, payload: SetAdStatusRequest): Promise<AdDto> {
    const response = await apiClient.post<ApiResponse<AdDto>>(
      `/dashboard/ads/${id}/status`,
      payload
    )
    return getApiData(response)
  },

  /**
   * Link the ad to a property. `POST /api/dashboard/ads/{id}/link-property`.
   */
  async linkProperty(
    id: number,
    payload: LinkAdPropertyRequest
  ): Promise<AdDto> {
    const response = await apiClient.post<ApiResponse<AdDto>>(
      `/dashboard/ads/${id}/link-property`,
      payload
    )
    return getApiData(response)
  },

  /**
   * Unlink the ad from its property. `DELETE /api/dashboard/ads/{id}/property`.
   */
  async unlinkProperty(id: number): Promise<AdDto> {
    const response = await apiClient.delete<ApiResponse<AdDto>>(
      `/dashboard/ads/${id}/property`
    )
    return getApiData(response)
  },

  /**
   * Record a public view event. `POST /api/ads/{id}/track/view`.
   */
  async trackView(id: number): Promise<void> {
    await apiClient.post(`/ads/${id}/track/view`)
  },

  /**
   * Record a public click-through event. `POST /api/ads/{id}/track/visit`.
   */
  async trackVisit(id: number): Promise<void> {
    await apiClient.post(`/ads/${id}/track/visit`)
  },
}
