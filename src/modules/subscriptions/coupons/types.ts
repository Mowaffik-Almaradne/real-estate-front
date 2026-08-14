import type { ApiPagination, Timestamps } from "@/types/common"
import type { DiscountType } from "@/types/enums"

export interface SubscriptionDiscount extends Timestamps {
  id: number
  code: string
  type: DiscountType
  value: number
  plan_id: number | null
  max_uses: number | null
  expires_at: string | null
  is_active: boolean
}

export interface CreateSubscriptionDiscountRequest {
  code: string
  type: DiscountType
  value: number
  plan_id?: number | null
  max_uses?: number | null
  expires_at?: string | null
  is_active?: boolean | null
}

export interface UpdateSubscriptionDiscountRequest {
  code?: string
  type?: DiscountType
  value?: number
  plan_id?: number | null
  max_uses?: number | null
  expires_at?: string | null
  is_active?: boolean | null
}

export interface ValidateCouponRequest {
  code: string
  plan_id?: number | null
}

export interface ValidateCouponResponse {
  valid: boolean
  code?: string
  discount_type?: DiscountType
  discount_value?: number
  discount_amount?: number
  final_amount?: number
  plan_id?: number | null
  plan_price?: number
  message?: string
  reason?: string
}

export interface SubscriptionDiscountFilters {
  search?: string
  type?: DiscountType
  is_active?: boolean
  plan_id?: number
  page?: number
  perPage?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export interface SubscriptionDiscountsResponse {
  data: SubscriptionDiscount[]
  pagination: ApiPagination
}

export const SUBSCRIPTION_DISCOUNT_CODE_MAX = 255
