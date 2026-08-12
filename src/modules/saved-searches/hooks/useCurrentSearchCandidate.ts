"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  EMPTY_SAVED_SEARCH_FILTERS,
  filtersFromQuery,
  isEmptyFilters,
  type SavedSearchFilters,
} from "../types"

interface UseCurrentSearchCandidateResult {
  filters: SavedSearchFilters
  isEmpty: boolean
  queryString: string
}

export function useCurrentSearchCandidate(): UseCurrentSearchCandidateResult {
  const searchParams = useSearchParams()

  const filters = useMemo<SavedSearchFilters>(() => {
    if (!searchParams) return EMPTY_SAVED_SEARCH_FILTERS
    return filtersFromQuery(searchParams.toString())
  }, [searchParams])

  const queryString = searchParams?.toString() ?? ""

  return {
    filters,
    isEmpty: isEmptyFilters(filters),
    queryString,
  }
}