import type { ApiPagination, Timestamps } from "@/types/common"
import {
  DepositCurrency,
  DepositStatus,
  PaymentMethod,
} from "./enums"
import type { DepositSortColumn, DepositSortOrder } from "./enums"

export interface DepositUserSummary {
  id: number
  name?: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
}

export interface DepositPropertySummary {
  id: number
  name?: string | null
  main_image?: string | null
  status?: string | null
  price?: number | string | null
  currency?: string | null
}

export interface DepositParty {
  id: number
  name?: string | null
  email?: string | null
}

export interface DepositAmount {
  amount: number | string
  currency: DepositCurrency | string
}

export interface DepositDto extends Timestamps {
  id: number
  property_id: number
  buyer_id: number
  seller_id: number
  amount: number | string
  currency: DepositCurrency | string
  status: DepositStatus
  payment_method?: PaymentMethod | string | null
  terms?: string | null
  notes?: string | null
  cancelled_at?: string | null
  cancelled_by?: number | null
  cancellation_reason?: string | null
  held_at?: string | null
  released_at?: string | null
  released_by?: number | null
  release_notes?: string | null
  refunded_at?: string | null
  refunded_by?: number | null
  refund_notes?: string | null
  disputed_at?: string | null
  property?: DepositPropertySummary | null
  buyer?: DepositParty | null
  seller?: DepositParty | null
}

export interface DepositListResponse {
  data: DepositDto[]
  pagination: ApiPagination
}

export interface DepositFilters {
  status?: DepositStatus
  property_id?: number
  buyer_id?: number
  seller_id?: number
  currency?: DepositCurrency
  search?: string
  sort_by?: DepositSortColumn
  sort_order?: DepositSortOrder
  page?: number
  perPage?: number
}

export interface CreateDepositInput {
  property_id: number
  seller_id: number
  amount: number
  currency?: DepositCurrency
  terms?: string | null
  notes?: string | null
}

export interface UpdateDepositInput {
  amount?: number
  terms?: string | null
  notes?: string | null
}

export interface PayDepositInput {
  payment_method: PaymentMethod
}

export interface ReleaseDepositInput {
  notes?: string | null
}

export interface RefundDepositInput {
  notes?: string | null
}

export interface CancelDepositInput {
  reason: string
}
