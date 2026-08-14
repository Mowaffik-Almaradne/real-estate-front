"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "src/context/AuthContext"
import { savedSearchService, SavedSearchServiceError } from "../services/savedSearchService"
import type {
  CreateSavedSearchRequest,
  SavedSearch,
  UpdateSavedSearchRequest,
} from "../types"

interface UseSavedSearchesResult {
  searches: SavedSearch[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (request: CreateSavedSearchRequest) => Promise<SavedSearch>
  update: (id: number, request: UpdateSavedSearchRequest) => Promise<SavedSearch>
  remove: (id: number) => Promise<void>
  toggleAlert: (id: number, enabled: boolean) => Promise<void>
  setAlertFrequency: (
    id: number,
    frequency: SavedSearch["alert_frequency"]
  ) => Promise<void>
}

export function useSavedSearches(refreshKey: number = 0): UseSavedSearchesResult {
  const { user } = useAuth()
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    if (!user) {
      setSearches([])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await savedSearchService.list()
      setSearches(data)
    } catch (err) {
      const message = err instanceof SavedSearchServiceError ? err.message : "Failed to load saved searches"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh, refreshKey])

  const create = useCallback(
    async (request: CreateSavedSearchRequest): Promise<SavedSearch> => {
      const created = await savedSearchService.create(request)
      setSearches((prev) => [created, ...prev])
      return created
    },
    []
  )

  const update = useCallback(
    async (id: number, request: UpdateSavedSearchRequest): Promise<SavedSearch> => {
      const updated = await savedSearchService.update(id, request)
      setSearches((prev) => prev.map((s) => (s.id === id ? updated : s)))
      return updated
    },
    []
  )

  const remove = useCallback(async (id: number): Promise<void> => {
    await savedSearchService.remove(id)
    setSearches((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const toggleAlert = useCallback(
    async (id: number, enabled: boolean): Promise<void> => {
      const updated = await savedSearchService.update(id, {
        alert_enabled: enabled,
        alert_frequency: enabled ? "daily" : "never",
      })
      setSearches((prev) => prev.map((s) => (s.id === id ? updated : s)))
    },
    []
  )

  const setAlertFrequency = useCallback(
    async (id: number, frequency: SavedSearch["alert_frequency"]): Promise<void> => {
      const enabled = frequency !== "never"
      const updated = await savedSearchService.update(id, {
        alert_enabled: enabled,
        alert_frequency: frequency,
      })
      setSearches((prev) => prev.map((s) => (s.id === id ? updated : s)))
    },
    []
  )

  return {
    searches,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    toggleAlert,
    setAlertFrequency,
  }
}