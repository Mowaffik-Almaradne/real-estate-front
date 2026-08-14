import type { ApiPagination, Timestamps } from "@/types/common"
import type { FeatureType, SubscriptionStatus } from "@/types/enums"

export interface SubscriptionFeatureLimit {
  id: number
  name: string
  slug: string
  type: FeatureType
  description: string | null
  is_enabled: boolean | null
  limit_value: number | null
  used?: number | null
}

export interface CurrentSubscriptionPlanSummary {
  id: number
  name: string
  slug: string
  description?: string | null
  price?: number | null
  currency?: string | null
  duration_days?: number | null
}

export interface CurrentSubscription {
  id: number
  user_id?: number
  plan_id: number
  plan?: CurrentSubscriptionPlanSummary | null
  status: SubscriptionStatus
  starts_at?: string | null
  ends_at?: string | null
  cancelled_at?: string | null
  remaining_days?: number | null
  features?: SubscriptionFeatureLimit[]
  created_at?: string
  updated_at?: string
}

export interface SubscriptionHistoryItem extends Timestamps {
  id: number
  plan_id: number
  plan?: CurrentSubscriptionPlanSummary | null
  status: SubscriptionStatus
  starts_at?: string | null
  ends_at?: string | null
  cancelled_at?: string | null
  created_at: string
}

export interface SubscriptionHistoryResponse {
  data: SubscriptionHistoryItem[]
  pagination: ApiPagination
}

export interface SubscriptionStatusLog extends Timestamps {
  id: number
  subscription_id: number
  from_status: SubscriptionStatus | null
  to_status: SubscriptionStatus
  notes?: string | null
  actor_id?: number | null
  created_at: string
}

export interface SubscriptionStatusLogsResponse {
  data: SubscriptionStatusLog[]
  pagination: ApiPagination
}

export interface CancelSubscriptionResponse {
  cancelled: boolean
  subscription?: CurrentSubscription | null
  message?: string | null
}
