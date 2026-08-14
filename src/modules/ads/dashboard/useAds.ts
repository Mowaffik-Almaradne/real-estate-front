"use client"

import { useCallback, useEffect, useState } from "react"
import { adService } from "../services/adService"
import { ApiClientError } from "@/lib/apiClient"
import type { ApiPagination } from "@/types/common"
import type {
  AdDto,
  AdFilters,
  CreateAdRequest,
  LinkAdPropertyRequest,
  SetAdStatusRequest,
  UpdateAdRequest,
} from "../types"

const EMPTY_PAGINATION: ApiPagination = {
  total: 0,
  per_page: 15,
  current_page: 1,
  last_page: 1,
  from: null,
  to: null,
}

interface UseAdsResult {
  ads: AdDto[]
  pagination: ApiPagination
  loading: boolean
  error: string | null
  filters: AdFilters
  page: number
  setFilters: (next: AdFilters) => void
  setPage: (page: number) => void
  refresh: () => Promise<void>
  create: (payload: CreateAdRequest) => Promise<AdDto>
  update: (id: number, payload: UpdateAdRequest) => Promise<AdDto>
  archive: (id: number) => Promise<void>
  restore: (id: number) => Promise<AdDto>
  setStatus: (id: number, payload: SetAdStatusRequest) => Promise<AdDto>
  linkProperty: (id: number, payload: LinkAdPropertyRequest) => Promise<AdDto>
  unlinkProperty: (id: number) => Promise<AdDto>
  patchLocal: (id: number, patch: Partial<AdDto>) => void
}

export function useAds(initial: AdFilters = {}): UseAdsResult {
  const [filters, setFiltersState] = useState<AdFilters>(initial)
  const [page, setPageState] = useState<number>(initial.page ?? 1)
  const [ads, setAds] = useState<AdDto[]>([])
  const [pagination, setPagination] = useState<ApiPagination>(EMPTY_PAGINATION)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setFilters = useCallback((next: AdFilters) => {
    setFiltersState(next)
    setPageState(1)
  }, [])

  const setPage = useCallback((next: number) => {
    setPageState(next)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adService.list({ ...filters, page, perPage: 15 })
      setAds(response.data)
      setPagination(response.pagination)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load ads"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  const create = useCallback(
    async (payload: CreateAdRequest): Promise<AdDto> => {
      const created = await adService.create(payload)
      setAds((prev) => [created, ...prev])
      return created
    },
    []
  )

  const update = useCallback(
    async (id: number, payload: UpdateAdRequest): Promise<AdDto> => {
      const updated = await adService.update(id, payload)
      setAds((prev) => prev.map((ad) => (ad.id === id ? updated : ad)))
      return updated
    },
    []
  )

  const archive = useCallback(async (id: number): Promise<void> => {
    await adService.archive(id)
    setAds((prev) => prev.filter((ad) => ad.id !== id))
  }, [])

  const restore = useCallback(async (id: number): Promise<AdDto> => {
    const restored = await adService.restore(id)
    setAds((prev) => {
      const existing = prev.find((ad) => ad.id === id)
      if (!existing) return [restored, ...prev]
      return prev.map((ad) => (ad.id === id ? restored : ad))
    })
    return restored
  }, [])

  const setStatus = useCallback(
    async (id: number, payload: SetAdStatusRequest): Promise<AdDto> => {
      const updated = await adService.setStatus(id, payload)
      setAds((prev) => prev.map((ad) => (ad.id === id ? updated : ad)))
      return updated
    },
    []
  )

  const linkProperty = useCallback(
    async (id: number, payload: LinkAdPropertyRequest): Promise<AdDto> => {
      const updated = await adService.linkProperty(id, payload)
      setAds((prev) => prev.map((ad) => (ad.id === id ? updated : ad)))
      return updated
    },
    []
  )

  const unlinkProperty = useCallback(async (id: number): Promise<AdDto> => {
    const updated = await adService.unlinkProperty(id)
    setAds((prev) => prev.map((ad) => (ad.id === id ? updated : ad)))
    return updated
  }, [])

  const patchLocal = useCallback((id: number, patch: Partial<AdDto>) => {
    setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, ...patch } : ad)))
  }, [])

  return {
    ads,
    pagination,
    loading,
    error,
    filters,
    page,
    setFilters,
    setPage,
    refresh,
    create,
    update,
    archive,
    restore,
    setStatus,
    linkProperty,
    unlinkProperty,
    patchLocal,
  }
}
