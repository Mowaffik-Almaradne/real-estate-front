"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { fetchSuggestions } from "./searchService"
import { SUGGESTION_DEBOUNCE_MS, type SearchSuggestion } from "./types"

export interface UseSearchSuggestionsResult {
  suggestions: SearchSuggestion[]
  loading: boolean
  query: string
  setQuery: (query: string) => void
  reset: () => void
}

export function useSearchSuggestions(): UseSearchSuggestionsResult {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const requestIdRef = useRef(0)

  const reset = useCallback(() => {
    setQuery("")
    setSuggestions([])
    setLoading(false)
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      void Promise.resolve().then(() => {
        setSuggestions([])
        setLoading(false)
      })
      return
    }

    const requestId = ++requestIdRef.current
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          setLoading(true)
          const results = await fetchSuggestions(trimmed)
          if (requestIdRef.current === requestId) {
            setSuggestions(results)
          }
        } finally {
          if (requestIdRef.current === requestId) {
            setLoading(false)
          }
        }
      })()
    }, SUGGESTION_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [query])

  return { suggestions, loading, query, setQuery, reset }
}