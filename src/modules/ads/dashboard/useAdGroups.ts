"use client"

import { useCallback, useEffect, useState } from "react"
import { adGroupService } from "../services/adGroupService"
import { ApiClientError } from "@/lib/apiClient"
import type { ApiPagination } from "@/types/common"
import type {
  AdGroupDto,
  AdGroupFilters,
  CreateAdGroupRequest,
  SetAdGroupDefaultRequest,
  UpdateAdGroupRequest,
} from "../types"

const EMPTY_PAGINATION: ApiPagination = {
  total: 0,
  per_page: 15,
  current_page: 1,
  last_page: 1,
  from: null,
  to: null,
}

interface UseAdGroupsResult {
  groups: AdGroupDto[]
  pagination: ApiPagination
  loading: boolean
  error: string | null
  filters: AdGroupFilters
  page: number
  setFilters: (next: AdGroupFilters) => void
  setPage: (page: number) => void
  refresh: () => Promise<void>
  create: (payload: CreateAdGroupRequest) => Promise<AdGroupDto>
  update: (id: number, payload: UpdateAdGroupRequest) => Promise<AdGroupDto>
  archive: (id: number) => Promise<void>
  restore: (id: number) => Promise<AdGroupDto>
  setDefault: (id: number, payload: SetAdGroupDefaultRequest) => Promise<AdGroupDto>
  removeDefault: (id: number) => Promise<AdGroupDto>
  patchLocal: (id: number, patch: Partial<AdGroupDto>) => void
}

export function useAdGroups(initial: AdGroupFilters = {}): UseAdGroupsResult {
  const [filters, setFiltersState] = useState<AdGroupFilters>(initial)
  const [page, setPageState] = useState<number>(initial.page ?? 1)
  const [groups, setGroups] = useState<AdGroupDto[]>([])
  const [pagination, setPagination] = useState<ApiPagination>(EMPTY_PAGINATION)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setFilters = useCallback((next: AdGroupFilters) => {
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
      const response = await adGroupService.list({
        ...filters,
        page,
        perPage: filters.perPage ?? 15,
      })
      setGroups(response.data)
      setPagination(response.pagination)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load ad groups"
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
    async (payload: CreateAdGroupRequest): Promise<AdGroupDto> => {
      const created = await adGroupService.create(payload)
      setGroups((prev) => [created, ...prev])
      return created
    },
    []
  )

  const update = useCallback(
    async (id: number, payload: UpdateAdGroupRequest): Promise<AdGroupDto> => {
      const updated = await adGroupService.update(id, payload)
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
      return updated
    },
    []
  )

  const archive = useCallback(async (id: number): Promise<void> => {
    await adGroupService.archive(id)
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const restore = useCallback(async (id: number): Promise<AdGroupDto> => {
    const restored = await adGroupService.restore(id)
    setGroups((prev) => {
      const existing = prev.find((g) => g.id === id)
      if (!existing) return [restored, ...prev]
      return prev.map((g) => (g.id === id ? restored : g))
    })
    return restored
  }, [])

  const setDefault = useCallback(
    async (id: number, payload: SetAdGroupDefaultRequest): Promise<AdGroupDto> => {
      const updated = await adGroupService.setDefault(id, payload)
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
      return updated
    },
    []
  )

  const removeDefault = useCallback(async (id: number): Promise<AdGroupDto> => {
    const updated = await adGroupService.removeDefault(id)
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
    return updated
  }, [])

  const patchLocal = useCallback((id: number, patch: Partial<AdGroupDto>) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }, [])

  return {
    groups,
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
    setDefault,
    removeDefault,
    patchLocal,
  }
}
