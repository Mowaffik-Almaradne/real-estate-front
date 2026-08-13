"use client"

import { useCallback, useEffect, useState } from "react"
import { adGroupService } from "../services/adGroupService"
import { ApiClientError } from "@/lib/apiClient"
import type { AdGroupDto } from "../types"

interface UseAdGroupResult {
  group: AdGroupDto | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useAdGroup(id: number): UseAdGroupResult {
  const [group, setGroup] = useState<AdGroupDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adGroupService.getById(id)
      setGroup(data)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load ad group"
      setError(message)
      setGroup(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  return { group, loading, error, refresh }
}
