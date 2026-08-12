"use client"

import { useEffect, useState } from "react"

export interface PropertyFiltersState {
  search: string
  status: string
  property_type: string
  type_of_contract: string
  country_id: string
  city_id: string
  publisher_id: string
  rooms: string
  bathrooms: string
}

const INITIAL_FILTERS: PropertyFiltersState = {
  search: "",
  status: "",
  property_type: "",
  type_of_contract: "",
  country_id: "",
  city_id: "",
  publisher_id: "",
  rooms: "",
  bathrooms: "",
}

const DEBOUNCE_MS = 300

export function usePropertyFilters() {
  const [filters, setFilters] = useState<PropertyFiltersState>(INITIAL_FILTERS)
  const [debouncedFilters, setDebouncedFilters] = useState<PropertyFiltersState>(INITIAL_FILTERS)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [filters])

  const clear = () => setFilters(INITIAL_FILTERS)

  const setFilterField = <K extends keyof PropertyFiltersState>(
    key: K,
    value: PropertyFiltersState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const setStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status }))
  }

  const hasActive = Object.values(filters).some(Boolean)

  return {
    filters,
    debouncedFilters,
    setFilterField,
    setStatusFilter,
    setFilters,
    clear,
    hasActive,
  }
}

export function buildPropertiesApiParams(
  filters: PropertyFiltersState,
  page: number
) {
  return {
    search: filters.search || undefined,
    status: filters.status || undefined,
    property_type: filters.property_type || undefined,
    type_of_contract: filters.type_of_contract || undefined,
    country_id: filters.country_id || undefined,
    city_id: filters.city_id || undefined,
    publisher_id: filters.publisher_id || undefined,
    rooms: filters.rooms.replace("+", "") || undefined,
    bathrooms: filters.bathrooms.replace("+", "") || undefined,
    page,
    per_page: 15,
  }
}