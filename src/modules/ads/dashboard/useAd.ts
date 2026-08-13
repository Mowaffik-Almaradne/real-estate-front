"use client"

import { useCallback, useEffect, useState } from "react"
import { adService } from "../services/adService"
import { ApiClientError } from "@/lib/apiClient"
import type { AdDto } from "../types"

interface UseAdResult {
  ad: AdDto | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useAd(id: number): UseAdResult {
  const [ad, setAd] = useState<AdDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adService.getById(id)
      setAd(data)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load ad"
      setError(message)
      setAd(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  return { ad, loading, error, refresh }
}
