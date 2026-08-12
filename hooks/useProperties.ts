"use client"

import useSWR from "swr"
import { apiClient } from "@/lib/apiClient"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const fetcher = async (url: string) => {
  const response = await apiClient.get(url)
  return response.data
}

function isRetryableError(err: unknown): boolean {
  const status =
    (err as { response?: { status?: number } })?.response?.status ?? 0
  return status === 0 || status === 408 || status === 429
}

export function useProperties(options?: {
  page?: number
  perPage?: number
  enabled?: boolean
}) {
  const { page = 1, perPage = 12, enabled = true } = options || {}

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    enabled
      ? `${apiUrl}/public/properties/browse?page=${page}&per_page=${perPage}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      fallbackData: undefined,
      shouldRetryOnError: isRetryableError,
      errorRetryCount: 2,
      errorRetryInterval: 5000,
    }
  )

  return {
    properties: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    isValidating,
    refresh: mutate,
  }
}

export function useFeaturedProperties(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {}
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    enabled ? `${apiUrl}/public/properties/random` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      fallbackData: undefined,
      shouldRetryOnError: isRetryableError,
      errorRetryCount: 2,
      errorRetryInterval: 5000,
    }
  )

  return {
    featuredProperties: data?.data || [],
    isLoading,
    isError: error,
    isValidating,
    refresh: mutate,
  }
}
