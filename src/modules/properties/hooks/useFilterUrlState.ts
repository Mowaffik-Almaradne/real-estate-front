"use client"

import { useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  EMPTY_FILTERS,
  type PropertyFilterValues,
} from "src/modules/properties/components/PropertyFilters"
import type { AdvancedFilterValues } from "src/modules/search/components/AdvancedFilters"

const DEFAULT_SORT = "created_at:desc"

type FilterKey =
  | "search"
  | "country_id"
  | "city_id"
  | "property_type"
  | "type_of_contract"
  | "rooms"
  | "bathrooms"
  | "min_price"
  | "max_price"
  | "area_min"
  | "area_max"
  | "year_built_min"
  | "year_built_max"
  | "keywords"
  | "sort"

function readFiltersFromParams(params: URLSearchParams): PropertyFilterValues {
  const get = (key: FilterKey): string => params.get(key) ?? ""

  const countryIdRaw = get("country_id")
  const cityIdRaw = get("city_id")
  return {
    search: get("search"),
    country_id: countryIdRaw ? Number(countryIdRaw) : null,
    city_id: cityIdRaw ? Number(cityIdRaw) : null,
    property_type: (get("property_type") as PropertyFilterValues["property_type"]) || "",
    type_of_contract:
      (get("type_of_contract") as PropertyFilterValues["type_of_contract"]) || "",
    rooms: get("rooms"),
    bathrooms: get("bathrooms"),
    min_price: get("min_price"),
    max_price: get("max_price"),
    sort: get("sort") || DEFAULT_SORT,
  }
}

function readAdvancedFromParams(params: URLSearchParams): AdvancedFilterValues {
  return {
    area_min: params.get("area_min") ?? "",
    area_max: params.get("area_max") ?? "",
    year_built_min: params.get("year_built_min") ?? "",
    year_built_max: params.get("year_built_max") ?? "",
    keywords: params.get("keywords") ?? "",
  }
}

function writeAdvancedToParams(values: AdvancedFilterValues): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  return params
}

function writeFiltersToParams(filters: PropertyFilterValues): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.country_id != null) params.set("country_id", String(filters.country_id))
  if (filters.city_id != null) params.set("city_id", String(filters.city_id))
  if (filters.property_type) params.set("property_type", filters.property_type)
  if (filters.type_of_contract) params.set("type_of_contract", filters.type_of_contract)
  if (filters.rooms) params.set("rooms", filters.rooms)
  if (filters.bathrooms) params.set("bathrooms", filters.bathrooms)
  if (filters.min_price) params.set("min_price", filters.min_price)
  if (filters.max_price) params.set("max_price", filters.max_price)
  if (filters.sort && filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort)
  return params
}

export interface UseFilterUrlStateResult {
  filters: PropertyFilterValues
  advanced: AdvancedFilterValues
  setFilters: (next: PropertyFilterValues) => void
  setAdvanced: (next: AdvancedFilterValues) => void
  patchFilters: (
    patch: Partial<PropertyFilterValues>,
    advancedPatch?: Partial<AdvancedFilterValues>
  ) => void
  reset: () => void
  hasActiveFilters: boolean
}

export function useFilterUrlState(): UseFilterUrlStateResult {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = useMemo<PropertyFilterValues>(() => {
    if (!searchParams) return EMPTY_FILTERS
    return readFiltersFromParams(new URLSearchParams(searchParams.toString()))
  }, [searchParams])
  const advanced = useMemo<AdvancedFilterValues>(() => {
    if (!searchParams) return { area_min: "", area_max: "", year_built_min: "", year_built_max: "", keywords: "" }
    return readAdvancedFromParams(new URLSearchParams(searchParams.toString()))
  }, [searchParams])

  const setFilters = useCallback(
    (next: PropertyFilterValues) => {
      const params = writeFiltersToParams(next)
      const qs = params.toString()
      const url = qs ? `${pathname}?${qs}` : pathname
      router.replace(url, { scroll: false })
    },
    [pathname, router]
  )

  const setAdvanced = useCallback(
    (next: AdvancedFilterValues) => {
      const base = searchParams
        ? new URLSearchParams(searchParams.toString())
        : new URLSearchParams()
      const merged = new URLSearchParams(base)
      Object.entries(writeAdvancedToParams(next)).forEach(([k, v]) => merged.set(k, v))
      // remove advanced keys that are now empty
      const advancedKeys: Array<keyof AdvancedFilterValues> = [
        "area_min",
        "area_max",
        "year_built_min",
        "year_built_max",
        "keywords",
      ]
      advancedKeys.forEach((key) => {
        if (!next[key]) merged.delete(key)
      })
      const qs = merged.toString()
      const url = qs ? `${pathname}?${qs}` : pathname
      router.replace(url, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const patchFilters = useCallback(
    (
      patch: Partial<PropertyFilterValues>,
      advancedPatch?: Partial<AdvancedFilterValues>
    ) => {
      const base = searchParams
        ? new URLSearchParams(searchParams.toString())
        : new URLSearchParams()
      const next = { ...filters, ...patch }
      const merged = writeFiltersToParams(next)
      base.forEach((value, key) => {
        if (!merged.has(key)) merged.set(key, value)
      })
      if (advancedPatch) {
        const advancedNext = { ...advanced, ...advancedPatch }
        advancedKeys.forEach((key) => {
          const v = advancedNext[key]
          if (v) merged.set(key, v)
          else merged.delete(key)
        })
      }
      const qs = merged.toString()
      const url = qs ? `${pathname}?${qs}` : pathname
      router.replace(url, { scroll: false })
    },
    [pathname, router, searchParams, filters, advanced]
  )

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [pathname, router])

  const hasActiveFilters =
    JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS) ||
    Boolean(advanced.area_min || advanced.area_max || advanced.year_built_min || advanced.year_built_max || advanced.keywords)

  return {
    filters,
    advanced,
    setFilters,
    setAdvanced,
    patchFilters,
    reset,
    hasActiveFilters,
  }
}

const advancedKeys: Array<keyof AdvancedFilterValues> = [
  "area_min",
  "area_max",
  "year_built_min",
  "year_built_max",
  "keywords",
]
