import type { ApiPagination, Timestamps } from "@/types/common"

export type AdGroupStatus = "active" | "inactive"

export const AD_GROUP_STATUSES: readonly AdGroupStatus[] = ["active", "inactive"] as const

export interface AdGroupDto extends Timestamps {
  id: number
  name: string
  description?: string | null
  status: AdGroupStatus
  is_archived?: boolean
  default_ad_id?: number | null
  default_ad?: AdGroupDefaultAdSummary | null
  ads_count?: number
  creator_id?: number | null
}

export interface AdGroupDefaultAdSummary {
  id: number
  title: string
  status?: string
  media_type?: string
}

export interface CreateAdGroupRequest {
  name: string
  description?: string | null
}

export interface UpdateAdGroupRequest {
  name?: string
  description?: string | null
  status?: AdGroupStatus
  is_archived?: boolean
}

export interface AdGroupFilters {
  search?: string
  status?: AdGroupStatus | "archived"
  page?: number
  perPage?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export interface AdGroupsResponse {
  data: AdGroupDto[]
  pagination: ApiPagination
}

export interface SetAdGroupDefaultRequest {
  ad_group_id: number
  ad_id: number
}

export const AD_GROUP_NAME_MAX = 255
export const AD_GROUP_DESCRIPTION_MAX = 1000
