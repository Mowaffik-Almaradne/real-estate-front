"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiClientError } from "@/lib/apiClient"
import { leadService } from "../services/crmService"
import type { Lead, LeadFilters, LeadsResponse } from "../types"

export interface UseLeadsResult {
  leads: Lead[]
  pagination: LeadsResponse["pagination"]
  loading: boolean
  error: string | null
  filters: LeadFilters
  setFilters: (updater: (prev: LeadFilters) => LeadFilters) => void
  refresh: () => Promise<void>
}

const EMPTY_PAGINATION: LeadsResponse["pagination"] = {
  current_page: 1,
  last_page: 1,
  per_page: 0,
  total: 0,
  from: null,
  to: null,
}

export function useLeads(initial: LeadFilters = {}): UseLeadsResult {
  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<LeadsResponse["pagination"]>(
    EMPTY_PAGINATION
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<LeadFilters>(initial)

  const setFilters = useCallback(
    (updater: (prev: LeadFilters) => LeadFilters) => {
      setFiltersState((prev) => updater(prev))
    },
    []
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await leadService.list(filters)
      setLeads(result.data)
      setPagination(result.pagination)
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to load leads"
      setError(message)
      setLeads([])
      setPagination(EMPTY_PAGINATION)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    Promise.resolve().then(() => void refresh())
  }, [refresh])

  return {
    leads,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  }
}
