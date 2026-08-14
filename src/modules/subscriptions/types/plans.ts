import type { ApiPagination, Timestamps } from "@/types/common"
import type { FeatureType } from "@/types/enums"

export interface SubscriptionPlanFeatureLink {
  id: number
  feature_id: number
  plan_id: number
  is_enabled: boolean | null
  limit_value: number | null
}

export interface SubscriptionFeature extends Timestamps {
  id: number
  name: string
  slug: string
  type: FeatureType
  description: string | null
}

export interface SubscriptionPlan extends Timestamps {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  currency: string | null
  duration_days: number
  is_active: boolean
  sort_order: number | null
  features?: SubscriptionPlanFeatureLink[]
  feature_details?: SubscriptionFeature[]
}

export interface CreateSubscriptionPlanRequest {
  name: string
  slug: string
  description?: string | null
  price: number
  currency?: string | null
  duration_days: number
  is_active?: boolean | null
  sort_order?: number | null
}

export interface UpdateSubscriptionPlanRequest {
  name?: string
  slug?: string
  description?: string | null
  price?: number
  currency?: string | null
  duration_days?: number
  is_active?: boolean | null
  sort_order?: number | null
}

export interface CreateSubscriptionFeatureRequest {
  name: string
  slug: string
  type: FeatureType
  description?: string | null
}

export interface UpdateSubscriptionFeatureRequest {
  name?: string
  slug?: string
  type?: FeatureType
  description?: string | null
}

export interface CreateSubscriptionPlanFeatureRequest {
  plan_id: number
  feature_id: number
  is_enabled?: boolean | null
  limit_value?: number | null
}

export interface UpdateSubscriptionPlanFeatureRequest {
  is_enabled?: boolean | null
  limit_value?: number | null
}

export interface SyncPlanFeaturesRequest {
  features: Array<{
    feature_id: number
    is_enabled?: boolean | null
    limit_value?: number | null
  }>
}

export interface SubscriptionPlanFilters {
  search?: string
  is_active?: boolean
  page?: number
  perPage?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export interface SubscriptionFeatureFilters {
  search?: string
  type?: FeatureType
  page?: number
  perPage?: number
}

export interface SubscriptionPlansResponse {
  data: SubscriptionPlan[]
  pagination: ApiPagination
}

export interface SubscriptionFeaturesResponse {
  data: SubscriptionFeature[]
  pagination: ApiPagination
}

export interface SubscriptionPlanFeaturesResponse {
  data: SubscriptionPlanFeatureLink[]
  pagination: ApiPagination
}

export const SUBSCRIPTION_PLAN_NAME_MAX = 255
export const SUBSCRIPTION_PLAN_SLUG_MAX = 255
export const SUBSCRIPTION_PLAN_DESCRIPTION_MAX = 1000
export const SUBSCRIPTION_FEATURE_NAME_MAX = 255
export const SUBSCRIPTION_FEATURE_SLUG_MAX = 255
export const SUBSCRIPTION_FEATURE_DESCRIPTION_MAX = 1000
