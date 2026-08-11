import { apiClient, getApiData, getApiPagination, type ApiResponse } from "@/lib/apiClient"
import type {
  CreateReviewRequest,
  ReviewableViewing,
  ReviewDto,
  ReviewFilters,
  ReviewStatistics,
  ReviewsResponse,
  UpdateReviewRequest,
} from "@/types/review"

export const reviewService = {
  async getReviews(filters: ReviewFilters = {}): Promise<ReviewsResponse> {
    const params = new URLSearchParams()
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.perPage) params.append("perPage", String(filters.perPage))

    const response = await apiClient.get<ApiResponse<ReviewDto[]>>("/reviews", {
      params: Object.fromEntries(params),
    })
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      pagination: pagination ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      },
    }
  },

  async getPropertyReviews(
    propertyId: number,
    filters: ReviewFilters = {}
  ): Promise<ReviewsResponse> {
    const params = new URLSearchParams()
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.perPage) params.append("perPage", String(filters.perPage))

    const response = await apiClient.get<ApiResponse<ReviewDto[]>>(
      `/properties/${propertyId}/reviews`,
      { params: Object.fromEntries(params) }
    )
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      pagination: pagination ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      },
    }
  },

  async getPublisherReviews(
    publisherId: number,
    filters: ReviewFilters = {}
  ): Promise<ReviewsResponse> {
    const params = new URLSearchParams()
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.perPage) params.append("perPage", String(filters.perPage))

    const response = await apiClient.get<ApiResponse<ReviewDto[]>>(
      `/users/${publisherId}/reviews`,
      { params: Object.fromEntries(params) }
    )
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      pagination: pagination ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      },
    }
  },

  async getStatistics(publisherId: number): Promise<ReviewStatistics> {
    const response = await apiClient.get<ApiResponse<ReviewStatistics>>(
      `/users/${publisherId}/review-stats`
    )
    return getApiData(response)
  },

  async getReviewableViewings(): Promise<ReviewableViewing[]> {
    const response = await apiClient.get<ApiResponse<ReviewableViewing[]>>(
      "/reviews/pending"
    )
    return getApiData(response)
  },

  async createReview(request: CreateReviewRequest): Promise<ReviewDto> {
    const response = await apiClient.post<ApiResponse<ReviewDto>>("/reviews", request)
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
