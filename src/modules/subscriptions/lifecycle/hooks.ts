"use client"

import { useCallback, useEffect, useState } from "react"
import { subscriptionLifecycleService } from "./service"
import type {
  CurrentSubscription,
  SubscriptionFeatureLimit,
  SubscriptionHistoryItem,
  SubscriptionStatusLog,
} from "./types"
import { ApiClientError } from "@/lib/apiClient"

export interface UseCurrentSubscriptionResult {
  subscription: CurrentSubscription | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  cancel: () => Promise<void>
  cancelling: boolean
}

export function useCurrentSubscription(): UseCurrentSubscriptionResult {
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await subscriptionLifecycleService.getCurrent()
      setSubscription(data)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load subscription"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  const cancel = useCallback(async () => {
    setCancelling(true)
    try {
      const response = await subscriptionLifecycleService.cancel()
      if (response.subscription) {
        setSubscription(response.subscription)
      } else {
        await refresh()
      }
    } finally {
      setCancelling(false)
    }
  }, [refresh])

  return { subscription, loading, error, refresh, cancel, cancelling }
}

export interface UseSubscriptionHistoryResult {
  history: SubscriptionHistoryItem[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useSubscriptionHistory(): UseSubscriptionHistoryResult {
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await subscriptionLifecycleService.getHistory()
      setHistory(items)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load subscription history"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  return { history, loading, error, refresh }
}

export interface UseSubscriptionFeatureAccessResult {
  features: SubscriptionFeatureLimit[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useSubscriptionFeatureAccess(): UseSubscriptionFeatureAccessResult {
  const [features, setFeatures] = useState<SubscriptionFeatureLimit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await subscriptionLifecycleService.getFeatures()
      setFeatures(items)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load subscription features"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  return { features, loading, error, refresh }
}

export interface UseSubscriptionStatusLogsResult {
  logs: SubscriptionStatusLog[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useSubscriptionStatusLogs(
  subscriptionId: number | null
): UseSubscriptionStatusLogsResult {
  const [logs, setLogs] = useState<SubscriptionStatusLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!subscriptionId) {
      setLogs([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const items = await subscriptionLifecycleService.getStatusLogs(
        subscriptionId
      )
      setLogs(items)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load status logs"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [subscriptionId])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  return { logs, loading, error, refresh }
}
