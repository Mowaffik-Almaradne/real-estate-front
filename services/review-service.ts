import { apiClient, getApiData, getApiPagination, ApiClientError, type ApiResponse } from "@/lib/apiClient"
import { getAuthToken } from "@/lib/auth"
import type {
  CreateReviewRequest,
  ReviewableViewing,
  ReviewDto,
  ReviewFilters,
  ReviewStatistics,
  ReviewsResponse,
  UpdateReviewRequest,
} from "@/types/review"

const EMPTY_PAGINATION = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
} as const

function emptyReviews(): ReviewsResponse {
  return { data: [], pagination: { ...EMPTY_PAGINATION } }
}

function toReviewsResponse(response: Awaited<ReturnType<typeof apiClient.get<ApiResponse<ReviewDto[]>>>>): ReviewsResponse {
  const data = getApiData(response)
  return {
    data: Array.isArray(data) ? data : [],
    pagination: getApiPagination(response) ?? { ...EMPTY_PAGINATION },
  }
}

/**
 * OpenAPI (`docs/openapi.yaml`) review routes:
 * - GET  /api/dashboard/offices/{officeId}/reviews  (list)
 * - POST /api/reviews                              (create: reviewed_id, rating, property_id?, comment?)
 * - DELETE /api/reviews/{id}
 *
 * There is NO `/api/properties/{id}/reviews` or public GET `/api/reviews`.
 */
export const reviewService = {
  /**
   * Legacy helper used by the reviews page. Backend has no GET /api/reviews —
   * return empty rather than 405/404 spam.
   */
  async getReviews(_filters: ReviewFilters = {}): Promise<ReviewsResponse> {
    return emptyReviews()
  },

  /**
   * Property details historically called `/properties/{id}/reviews` (404).
   * OpenAPI scopes reviews to the office/publisher, optionally related to a property.
   */
  async getPropertyReviews(
    propertyId: number,
    filters: ReviewFilters & { officeId?: number } = {}
  ): Promise<ReviewsResponse> {
    const officeId = filters.officeId
    if (!officeId || officeId <= 0) return emptyReviews()

    const result = await this.getOfficeReviews(officeId, filters)
    if (propertyId > 0) {
      return {
        ...result,
        data: result.data.filter(
          (review) => !review.property_id || review.property_id === propertyId
        ),
      }
    }
    return result
  },

  /**
   * GET /api/dashboard/offices/{officeId}/reviews
   *
   * OpenAPI documents this as the only reviews list route. On this backend it is
   * permission-gated (403 for normal consumers). Prefer not calling it from
   * public property pages — use publisher `average_rating` from property details.
   */
  async getOfficeReviews(
    officeId: number,
    filters: ReviewFilters = {}
  ): Promise<ReviewsResponse> {
    if (!officeId || officeId <= 0) return emptyReviews()
    if (!getAuthToken()) return emptyReviews()

    const params: Record<string, string> = {}
    if (filters.sort_by) params.sort_by = filters.sort_by
    if (filters.sort_order) params.sort_order = filters.sort_order
    if (filters.page) params.page = String(filters.page)
    if (filters.perPage) params.perPage = String(filters.perPage)

    try {
      const response = await apiClient.get<ApiResponse<ReviewDto[]>>(
        `/dashboard/offices/${officeId}/reviews`,
        { params, silent: true }
      )
      return toReviewsResponse(response)
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        (error.isNotFound() || error.isUnauthorized() || error.isForbidden())
      ) {
        return emptyReviews()
      }
      throw error
    }
  },

  /** Alias for OpenAPI office reviews (publisher == office user id). */
  async getPublisherReviews(
    publisherId: number,
    filters: ReviewFilters = {}
  ): Promise<ReviewsResponse> {
    return this.getOfficeReviews(publisherId, filters)
  },

  async getStatistics(publisherId: number): Promise<ReviewStatistics> {
    const reviews = await this.getOfficeReviews(publisherId, { perPage: 100 })
    const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let sum = 0
    for (const review of reviews.data) {
      const rounded = Math.max(1, Math.min(5, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5
      breakdown[rounded]++
      sum += review.rating
    }
    const total = reviews.data.length
    return {
      average_rating: total ? sum / total : 0,
      total_reviews: total,
      breakdown,
    }
  },

  async getReviewableViewings(): Promise<ReviewableViewing[]> {
    try {
      const response = await apiClient.get<ApiResponse<ReviewableViewing[]>>(
        "/reviews/pending",
        { silent: true }
      )
      const data = getApiData(response)
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  /**
   * POST /api/reviews
   * OpenAPI body: reviewed_id, rating, property_id?, comment?
   * Frontend form still collects title/body/viewing — map to backend fields.
   */
  async createReview(request: CreateReviewRequest): Promise<ReviewDto> {
    const payload = {
      reviewed_id: request.reviewed_id ?? request.publisher_id,
      property_id: request.property_id ?? null,
      rating: request.rating,
      comment: request.comment ?? request.body ?? request.title ?? null,
    }
    const response = await apiClient.post<ApiResponse<ReviewDto>>("/reviews", payload)
    return getApiData(response)
  },

  async updateReview(id: number, request: UpdateReviewRequest): Promise<ReviewDto> {
    const response = await apiClient.put<ApiResponse<ReviewDto>>(
      `/reviews/${id}`,
      request
    )
    return getApiData(response)
  },

  async deleteReview(id: number): Promise<void> {
    await apiClient.delete(`/reviews/${id}`)
  },
}
