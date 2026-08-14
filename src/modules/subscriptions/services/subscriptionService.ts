import {
  apiClient,
  ApiClientError,
  getApiData,
  getApiPagination,
  type ApiResponse,
  type ApiPagination,
} from "@/lib/apiClient"
import type {
  CreateSubscriptionFeatureRequest,
  CreateSubscriptionPlanFeatureRequest,
  CreateSubscriptionPlanRequest,
  SubscriptionFeature,
  SubscriptionFeatureFilters,
  SubscriptionFeaturesResponse,
  SubscriptionPlan,
  SubscriptionPlanFeatureLink,
  SubscriptionPlanFeaturesResponse,
  SubscriptionPlanFilters,
  SubscriptionPlansResponse,
  SyncPlanFeaturesRequest,
  UpdateSubscriptionFeatureRequest,
  UpdateSubscriptionPlanFeatureRequest,
  UpdateSubscriptionPlanRequest,
} from "../types"

export { ApiClientError as SubscriptionsServiceError }

const EMPTY_PAGINATION: ApiPagination = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 1,
  from: null,
  to: null,
}

function buildPlanParams(filters: SubscriptionPlanFilters = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filters.search) params.search = filters.search
  if (filters.is_active != null) params.is_active = filters.is_active ? 1 : 0
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.perPage = filters.perPage
  if (filters.sort_by) params.sort_by = filters.sort_by
  if (filters.sort_order) params.sort_order = filters.sort_order
  return params
}

function buildFeatureParams(
  filters: SubscriptionFeatureFilters = {}
): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filters.search) params.search = filters.search
  if (filters.type) params.type = filters.type
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.perPage = filters.perPage
  return params
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
 * Public catalogue endpoints (per OpenAPI). These endpoints are unauthenticated
 * in the contract but the apiClient will still attach the bearer token when
 * present — the backend ignores it.
 */
export const subscriptionPlanService = {
  async listPublic(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>(
      "/plans",
      { silent: true }
    )
    const data = getApiData(response)
    return resolveArray<SubscriptionPlan>(data)
  },

  async getPublicById(id: number): Promise<SubscriptionPlan> {
    const response = await apiClient.get<ApiResponse<SubscriptionPlan>>(
      `/plans/${id}`,
      { silent: true }
    )
    return getApiData(response)
  },
}

/**
 * Admin CRUD for subscription plans. The OpenAPI spec exposes these endpoints
 * under `/api/admin/subscription/plans` and they require admin permissions
 * (`subscription_plans.*`).
 */
export const adminSubscriptionPlanService = {
  async list(filters: SubscriptionPlanFilters = {}): Promise<SubscriptionPlansResponse> {
    const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>(
      "/admin/subscription/plans",
      { params: buildPlanParams(filters) }
    )
    const data = getApiData(response)
    const items = resolveArray<SubscriptionPlan>(data)
    return {
      data: items,
      pagination: getApiPagination(response) ?? paginationFor(items),
    }
  },

  async getById(id: number): Promise<SubscriptionPlan> {
    const response = await apiClient.get<ApiResponse<SubscriptionPlan>>(
      `/admin/subscription/plans/${id}`
    )
    return getApiData(response)
  },

  async create(payload: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    const response = await apiClient.post<ApiResponse<SubscriptionPlan>>(
      "/admin/subscription/plans",
      payload
    )
    return getApiData(response)
  },

  async update(
    id: number,
    payload: UpdateSubscriptionPlanRequest
  ): Promise<SubscriptionPlan> {
    const response = await apiClient.patch<ApiResponse<SubscriptionPlan>>(
      `/admin/subscription/plans/${id}`,
      payload
    )
    return getApiData(response)
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/subscription/plans/${id}`)
  },

  async syncFeatures(
    id: number,
    payload: SyncPlanFeaturesRequest
  ): Promise<SubscriptionPlan> {
    const response = await apiClient.post<ApiResponse<SubscriptionPlan>>(
      `/admin/subscription/plans/${id}/features`,
      payload
    )
    return getApiData(response)
  },
}

/**
 * Admin CRUD for subscription features at `/api/admin/subscription/features`.
 */
export const adminSubscriptionFeatureService = {
  async list(
    filters: SubscriptionFeatureFilters = {}
  ): Promise<SubscriptionFeaturesResponse> {
    const response = await apiClient.get<ApiResponse<SubscriptionFeature[]>>(
      "/admin/subscription/features",
      { params: buildFeatureParams(filters) }
    )
    const data = getApiData(response)
    const items = resolveArray<SubscriptionFeature>(data)
    return {
      data: items,
      pagination: getApiPagination(response) ?? paginationFor(items),
    }
  },

  async getById(id: number): Promise<SubscriptionFeature> {
    const response = await apiClient.get<ApiResponse<SubscriptionFeature>>(
      `/admin/subscription/features/${id}`
    )
    return getApiData(response)
  },

  async create(
    payload: CreateSubscriptionFeatureRequest
  ): Promise<SubscriptionFeature> {
    const response = await apiClient.post<ApiResponse<SubscriptionFeature>>(
      "/admin/subscription/features",
      payload
    )
    return getApiData(response)
  },

  async update(
    id: number,
    payload: UpdateSubscriptionFeatureRequest
  ): Promise<SubscriptionFeature> {
    const response = await apiClient.patch<ApiResponse<SubscriptionFeature>>(
      `/admin/subscription/features/${id}`,
      payload
    )
    return getApiData(response)
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/subscription/features/${id}`)
  },
}

/**
 * Admin CRUD for subscription plan � feature pivot rows at
 * `/api/admin/subscription/plan-features`.
 */
export const adminSubscriptionPlanFeatureService = {
  async list(
    filters: { plan_id?: number; feature_id?: number; page?: number; perPage?: number } = {}
  ): Promise<SubscriptionPlanFeaturesResponse> {
    const params: Record<string, string | number> = {}
    if (filters.plan_id != null) params.plan_id = filters.plan_id
    if (filters.feature_id != null) params.feature_id = filters.feature_id
    if (filters.page) params.page = filters.page
    if (filters.perPage) params.perPage = filters.perPage
    const response = await apiClient.get<ApiResponse<SubscriptionPlanFeatureLink[]>>(
      "/admin/subscription/plan-features",
      { params }
    )
    const data = getApiData(response)
    const items = resolveArray<SubscriptionPlanFeatureLink>(data)
    return {
      data: items,
      pagination: getApiPagination(response) ?? paginationFor(items),
    }
  },

  async create(
    payload: CreateSubscriptionPlanFeatureRequest
  ): Promise<SubscriptionPlanFeatureLink> {
    const response = await apiClient.post<ApiResponse<SubscriptionPlanFeatureLink>>(
      "/admin/subscription/plan-features",
      payload
    )
    return getApiData(response)
  },

  async update(
    id: number,
    payload: UpdateSubscriptionPlanFeatureRequest
  ): Promise<SubscriptionPlanFeatureLink> {
    const response = await apiClient.patch<ApiResponse<SubscriptionPlanFeatureLink>>(
      `/admin/subscription/plan-features/${id}`,
      payload
    )
    return getApiData(response)
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/subscription/plan-features/${id}`)
  },
}
