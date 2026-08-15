"use client"

import { useCallback, useEffect, useState } from "react"
import {
  adminSubscriptionPlanService,
  adminSubscriptionFeatureService,
} from "../services/subscriptionService"
import type {
  SubscriptionPlan,
  SubscriptionFeature,
  SubscriptionPlanFilters,
  SubscriptionFeatureFilters,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  CreateSubscriptionFeatureRequest,
  UpdateSubscriptionFeatureRequest,
} from "../types"
import { ApiClientError } from "@/lib/apiClient"
import type { ApiPagination } from "@/types/common"

export interface UseSubscriptionPlansResult {
  plans: SubscriptionPlan[]
  pagination: ApiPagination
  loading: boolean
  error: string | null
  filters: SubscriptionPlanFilters
  setFilters: (next: SubscriptionPlanFilters) => void
  refresh: () => Promise<void>
  create: (payload: CreateSubscriptionPlanRequest) => Promise<SubscriptionPlan>
  update: (
    id: number,
    payload: UpdateSubscriptionPlanRequest
  ) => Promise<SubscriptionPlan>
  remove: (id: number) => Promise<void>
}

export function useSubscriptionPlans(
  initial: SubscriptionPlanFilters = { page: 1, perPage: 15 }
): UseSubscriptionPlansResult {
  const [filters, setFiltersState] = useState<SubscriptionPlanFilters>(initial)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
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

  const setFilters = useCallback((next: SubscriptionPlanFilters) => {
    setFiltersState({
      ...next,
      page: next.page ?? 1,
      perPage: next.perPage ?? 15,
    })
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminSubscriptionPlanService.list(filters)
      setPlans(response.data)
      setPagination(response.pagination)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load plans"
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
    async (payload: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> => {
      const created = await adminSubscriptionPlanService.create(payload)
      setPlans((prev) => [created, ...prev])
      return created
    },
    []
  )

  const update = useCallback(
    async (
      id: number,
      payload: UpdateSubscriptionPlanRequest
    ): Promise<SubscriptionPlan> => {
      const updated = await adminSubscriptionPlanService.update(id, payload)
      setPlans((prev) => prev.map((plan) => (plan.id === id ? updated : plan)))
      return updated
    },
    []
  )

  const remove = useCallback(async (id: number): Promise<void> => {
    await adminSubscriptionPlanService.remove(id)
    setPlans((prev) => prev.filter((plan) => plan.id !== id))
  }, [])

  return {
    plans,
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

export interface UseSubscriptionFeaturesResult {
  features: SubscriptionFeature[]
  pagination: ApiPagination
  loading: boolean
  error: string | null
  filters: SubscriptionFeatureFilters
  setFilters: (next: SubscriptionFeatureFilters) => void
  refresh: () => Promise<void>
  create: (
    payload: CreateSubscriptionFeatureRequest
  ) => Promise<SubscriptionFeature>
  update: (
    id: number,
    payload: UpdateSubscriptionFeatureRequest
  ) => Promise<SubscriptionFeature>
  remove: (id: number) => Promise<void>
}

export function useSubscriptionFeatures(
  initial: SubscriptionFeatureFilters = { page: 1, perPage: 15 }
): UseSubscriptionFeaturesResult {
  const [filters, setFiltersState] = useState<SubscriptionFeatureFilters>(initial)
  const [features, setFeatures] = useState<SubscriptionFeature[]>([])
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

  const setFilters = useCallback((next: SubscriptionFeatureFilters) => {
    setFiltersState({
      ...next,
      page: next.page ?? 1,
      perPage: next.perPage ?? 15,
    })
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminSubscriptionFeatureService.list(filters)
      setFeatures(response.data)
      setPagination(response.pagination)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load features"
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
    async (
      payload: CreateSubscriptionFeatureRequest
    ): Promise<SubscriptionFeature> => {
      const created = await adminSubscriptionFeatureService.create(payload)
      setFeatures((prev) => [created, ...prev])
      return created
    },
    []
  )

  const update = useCallback(
    async (
      id: number,
      payload: UpdateSubscriptionFeatureRequest
    ): Promise<SubscriptionFeature> => {
      const updated = await adminSubscriptionFeatureService.update(id, payload)
      setFeatures((prev) =>
        prev.map((feature) => (feature.id === id ? updated : feature))
      )
      return updated
    },
    []
  )

  const remove = useCallback(async (id: number): Promise<void> => {
    await adminSubscriptionFeatureService.remove(id)
    setFeatures((prev) => prev.filter((feature) => feature.id !== id))
  }, [])

  return {
    features,
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
