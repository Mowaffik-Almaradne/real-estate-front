"use client"

import { useCallback, useEffect, useState } from "react"

import {
  clearRecentSearches,
  loadRecentSearches,
  pushRecentSearch,
  removeRecentSearch,
} from "./searchService"
import type { RecentSearch } from "./types"

export interface UseRecentSearchesResult {
  items: RecentSearch[]
  add: (query: string) => void
  remove: (query: string) => void
  clear: () => void
  isHydrated: boolean
}

/**
 * Manages the localStorage-backed recent searches list.
 */
export function useRecentSearches(): UseRecentSearchesResult {
  const [items, setItems] = useState<RecentSearch[]>([])
  const [isHydrated, setHydrated] = useState(false)

  useEffect(() => {
    Promise.resolve().then(() => {
      setItems(loadRecentSearches())
      setHydrated(true)
    })
  }, [])

  const add = useCallback((query: string) => {
    setItems(pushRecentSearch(query))
  }, [])

  const remove = useCallback((query: string) => {
    setItems(removeRecentSearch(query))
  }, [])

  const clear = useCallback(() => {
    clearRecentSearches()
    setItems([])
  }, [])

  return { items, add, remove, clear, isHydrated }
}