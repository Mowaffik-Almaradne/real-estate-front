import type { ApiPagination, Timestamps } from "@/types/common"
import { AdMediaType, AdStatus } from "@/types/enums"

export interface AdMediaItem {
  id: number
  url: string
  thumb_url?: string | null
  original_url?: string
  mime_type?: string | null
  size?: number
  name?: string
  collection?: string | null
}

export interface AdDto extends Timestamps {
  id: number
  title: string
  description?: string | null
  status: AdStatus
  media_type: AdMediaType
  ad_group_id?: number | null
  ad_group?: AdGroupSummary | null
  property_id?: number | null
  property?: AdPropertySummary | null
  external_url?: string | null
  start_date?: string | null
  end_date?: string | null
  is_default?: boolean
  is_archived?: boolean
  views_count?: number
  visits_count?: number
  media?: AdMediaItem[]
  creator_id?: number | null
}

export interface AdGroupSummary {
  id: number
  name: string
}

export interface AdPropertySummary {
  id: number
  name: string
  main_image?: string | null
  city?: { id: number; name: string } | null
  formatted_price?: string | null
}

export interface CreateAdRequest {
  title: string
  description?: string | null
  status?: AdStatus
  media_type: AdMediaType
  ad_group_id?: number | null
  property_id?: number | null
  external_url?: string | null
  start_date?: string | null
  end_date?: string | null
  media?: number[] | string[]
}

export interface UpdateAdRequest {
  title?: string
  description?: string | null
  status?: AdStatus
  media_type?: AdMediaType
  ad_group_id?: number | null
  property_id?: number | null
  external_url?: string | null
  start_date?: string | null
  end_date?: string | null
  media?: number[] | string[]
}

export interface AdFilters {
  search?: string
  status?: AdStatus
  ad_group_id?: number
  page?: number
  perPage?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export interface AdsResponse {
  data: AdDto[]
  pagination: ApiPagination
}

export interface SetAdStatusRequest {
  status: AdStatus
}

export interface LinkAdPropertyRequest {
  property_id: number
}

export const AD_TITLE_MAX = 255
export const AD_DESCRIPTION_MAX = 2000
export const AD_EXTERNAL_URL_MAX = 2048
