"use client"

import { useCallback, useEffect, useState } from "react"
import { analyticsService } from "../services/analyticsService"
import type { AnalyticsRange, AnalyticsSummary } from "../types"

interface UseAnalyticsResult {
  summary: AnalyticsSummary | null
  isLoading: boolean
  error: string | null
  range: AnalyticsRange
  propertyId: number | null
  setRange: (range: AnalyticsRange) => void
  setPropertyId: (id: number | null) => void
  refresh: () => Promise<void>
}

export function useAnalytics(
  initialRange: AnalyticsRange = "30d",
  initialPropertyId: number | null = null
): UseAnalyticsResult {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [range, setRange] = useState<AnalyticsRange>(initialRange)
  const [propertyId, setPropertyId] = useState<number | null>(initialPropertyId)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await analyticsService.getOwnerSummary(
        range,
        propertyId ?? undefined
      )
      setSummary(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load analytics"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [range, propertyId])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  return {
    summary,
    isLoading,
    error,
    range,
    propertyId,
    setRange,
    setPropertyId,
    refresh,
  }
}