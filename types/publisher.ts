import type { ApiPagination } from "./common"
import { PublisherType } from "@/types/enums"

export interface PublisherProfileDto {
  readonly id: number
  readonly name: string
  readonly email?: string | null
  readonly phone?: string | null
  readonly avatar_url?: string | null
  readonly publisher_type: PublisherType
  readonly is_verified: boolean
  readonly description: string | null
  readonly website_url: string | null
  readonly social_links?: Record<string, string> | null
  readonly average_rating: number | null
  readonly reviews_count: number
  readonly properties_count: number
  readonly employees_count: number | null
  readonly created_at: string
}

export interface PublisherPropertyFilters {
  page?: number
  perPage?: number
  sort_by?: "created_at" | "price"
  sort_order?: "asc" | "desc"
}

export interface PublisherPropertiesResponse {
  data: import("./dto").PropertyDto[]
  pagination: ApiPagination
}