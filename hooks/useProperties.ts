"use client"

import axios from "axios"
import useSWR from "swr"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const fetcher = async (url: string) => {
  const response = await axios.get(url)
  return response.data
}

export function useProperties(options?: {
  page?: number
  perPage?: number
  enabled?: boolean
}) {
  const { page = 1, perPage = 12, enabled = true } = options || {}

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    enabled
      ? `${apiUrl}/properties?page=${page}&per_page=${perPage}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      fallbackData: undefined,
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
    enabled ? `${apiUrl}/properties/random` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      fallbackData: undefined,
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