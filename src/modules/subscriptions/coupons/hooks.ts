"use client"

import { useCallback, useEffect, useState } from "react"
import { adminCouponService, couponService } from "./service"
import type {
  CreateSubscriptionDiscountRequest,
  SubscriptionDiscount,
  SubscriptionDiscountFilters,
  UpdateSubscriptionDiscountRequest,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from "./types"
import { ApiClientError } from "@/lib/apiClient"
import type { ApiPagination } from "@/types/common"

export interface UseCouponsResult {
  coupons: SubscriptionDiscount[]
  pagination: ApiPagination
  loading: boolean
  error: string | null
  filters: SubscriptionDiscountFilters
  setFilters: (filters: SubscriptionDiscountFilters) => void
  refresh: () => Promise<void>
  create: (payload: CreateSubscriptionDiscountRequest) => Promise<SubscriptionDiscount>
  update: (
    id: number,
    payload: UpdateSubscriptionDiscountRequest
  ) => Promise<SubscriptionDiscount>
  remove: (id: number) => Promise<void>
}

export function useCoupons(initial: SubscriptionDiscountFilters = {}): UseCouponsResult {
  const [filters, setFiltersState] = useState<SubscriptionDiscountFilters>(initial)
  const [coupons, setCoupons] = useState<SubscriptionDiscount[]>([])
  const [pagination, setPagination] = useState<ApiPagination>({
    total: 0,
    per_page: 0,
    current_page: 1,
    last_page: 1,
    from: null,
    to: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setFilters = useCallback((next: SubscriptionDiscountFilters) => {
    setFiltersState(next)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminCouponService.list(filters)
      setCoupons(response.data)
      setPagination(response.pagination)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load coupons"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  const create = useCallback(
    async (payload: CreateSubscriptionDiscountRequest): Promise<SubscriptionDiscount> => {
      const created = await adminCouponService.create(payload)
      setCoupons((prev) => [created, ...prev])
      return created
    },
    []
  )

  const update = useCallback(
    async (
      id: number,
      payload: UpdateSubscriptionDiscountRequest
    ): Promise<SubscriptionDiscount> => {
      const updated = await adminCouponService.update(id, payload)
      setCoupons((prev) =>
        prev.map((coupon) => (coupon.id === id ? updated : coupon))
      )
      return updated
    },
    []
  )

  const remove = useCallback(async (id: number): Promise<void> => {
    await adminCouponService.remove(id)
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id))
  }, [])

  return {
    coupons,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    create,
    update,
    remove,
  }
}

export interface UseCouponValidationResult {
  result: ValidateCouponResponse | null
  loading: boolean
  error: string | null
  validate: (request: ValidateCouponRequest) => Promise<ValidateCouponResponse>
  reset: () => void
}

export function useCouponValidation(): UseCouponValidationResult {
  const [result, setResult] = useState<ValidateCouponResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback(
    async (request: ValidateCouponRequest): Promise<ValidateCouponResponse> => {
      setLoading(true)
      setError(null)
      try {
        const response = await couponService.validate(request)
        setResult(response)
        return response
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to validate coupon"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, validate, reset }
}
