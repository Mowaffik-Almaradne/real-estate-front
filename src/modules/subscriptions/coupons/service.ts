import {
  apiClient,
  ApiClientError,
  getApiData,
  type ApiResponse,
  type ApiPagination,
} from "@/lib/apiClient"
import type {
  CreateSubscriptionDiscountRequest,
  SubscriptionDiscount,
  SubscriptionDiscountFilters,
  SubscriptionDiscountsResponse,
  UpdateSubscriptionDiscountRequest,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from "./types"

export { ApiClientError as CouponServiceError }

const EMPTY_PAGINATION: ApiPagination = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 1,
  from: null,
  to: null,
}

function buildParams(filters: SubscriptionDiscountFilters = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filters.search) params.search = filters.search
  if (filters.type) params.type = filters.type
  if (filters.is_active != null) params.is_active = filters.is_active ? 1 : 0
  if (filters.plan_id != null) params.plan_id = filters.plan_id
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.perPage = filters.perPage
  if (filters.sort_by) params.sort_by = filters.sort_by
  if (filters.sort_order) params.sort_order = filters.sort_order
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
 * Public coupon validation endpoint. `POST /api/coupons/validate` returns the
 * computed discount the user will receive when applying this code at checkout.
 */
export const couponService = {
  async validate(request: ValidateCouponRequest): Promise<ValidateCouponResponse> {
    const response = await apiClient.post<ApiResponse<ValidateCouponResponse>>(
      "/coupons/validate",
      request
    )
    return getApiData(response)
  },
}

/**
 * Admin CRUD for subscription discounts at `/api/admin/subscription/discounts`.
 */
export const adminCouponService = {
  async list(
    filters: SubscriptionDiscountFilters = {}
  ): Promise<SubscriptionDiscountsResponse> {
    const response = await apiClient.get<ApiResponse<SubscriptionDiscount[]>>(
      "/admin/subscription/discounts",
      { params: buildParams(filters) }
    )
    const data = getApiData(response)
    const items = resolveArray<SubscriptionDiscount>(data)
    return {
      data: items,
      pagination: paginationFor(items),
    }
  },

  async getById(id: number): Promise<SubscriptionDiscount> {
    const response = await apiClient.get<ApiResponse<SubscriptionDiscount>>(
      `/admin/subscription/discounts/${id}`
    )
    return getApiData(response)
  },

  async create(
    payload: CreateSubscriptionDiscountRequest
  ): Promise<SubscriptionDiscount> {
    const response = await apiClient.post<ApiResponse<SubscriptionDiscount>>(
      "/admin/subscription/discounts",
      payload
    )
    return getApiData(response)
  },

  async update(
    id: number,
    payload: UpdateSubscriptionDiscountRequest
  ): Promise<SubscriptionDiscount> {
    const response = await apiClient.patch<ApiResponse<SubscriptionDiscount>>(
      `/admin/subscription/discounts/${id}`,
      payload
    )
    return getApiData(response)
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/subscription/discounts/${id}`)
  },
}
