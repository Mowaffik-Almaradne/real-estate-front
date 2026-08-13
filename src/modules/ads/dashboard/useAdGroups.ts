"use client"

import { useCallback, useEffect, useState } from "react"
import { adGroupService } from "../services/adGroupService"
import { ApiClientError } from "@/lib/apiClient"
import type {
  AdGroupDto,
  AdGroupFilters,
  CreateAdGroupRequest,
  SetAdGroupDefaultRequest,
  UpdateAdGroupRequest,
} from "../types"

interface UseAdGroupsResult {
  groups: AdGroupDto[]
  loading: boolean
  error: string | null
  filters: AdGroupFilters
  setFilters: (next: AdGroupFilters) => void
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
  const [groups, setGroups] = useState<AdGroupDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setFilters = useCallback((next: AdGroupFilters) => {
    setFiltersState(next)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adGroupService.list(filters)
      setGroups(response.data)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load ad groups"
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
    loading,
    error,
    filters,
    setFilters,
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
