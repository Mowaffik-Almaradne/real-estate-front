import type { ApiPagination } from "./common"

export interface ReviewDto {
  readonly id: number
  readonly reviewer: ReviewerSummary | null
  readonly property_id: number
  readonly property_title?: string | null
  readonly publisher_id: number
  readonly rating: number
  readonly title: string | null
  readonly body: string | null
  readonly is_anonymous: boolean
  readonly created_at: string
  readonly updated_at: string | null
}

export interface ReviewerSummary {
  readonly id: number
  readonly name: string
  readonly avatar_url: string | null
}

export interface ReviewableViewing {
  readonly viewing_id: number
  readonly property_id: number
  readonly property_title: string
  readonly publisher_id: number
  readonly publisher_name: string
  readonly completed_at: string
}

export interface ReviewStatistics {
  readonly average_rating: number
  readonly total_reviews: number
  readonly breakdown: Record<1 | 2 | 3 | 4 | 5, number>
}

export interface CreateReviewRequest {
  viewing_id: number
  rating: number
  title?: string | null
  body?: string | null
  is_anonymous?: boolean
}

export interface UpdateReviewRequest {
  rating?: number
  title?: string | null
  body?: string | null
  is_anonymous?: boolean
}

export interface ReviewFilters {
  page?: number
  perPage?: number
  sort_by?: "created_at" | "rating"
  sort_order?: "asc" | "desc"
}

export interface ReviewsResponse {
  data: ReviewDto[]
  pagination: ApiPagination
}
