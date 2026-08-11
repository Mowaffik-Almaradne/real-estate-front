/**
 * Saved searches + property alerts.
 *
 * A saved search is a named snapshot of the active property filters that the
 * user can re-apply, delete, or subscribe to for alerts.
 */

export const ALERT_FREQUENCIES = ["instant", "daily", "weekly", "never"] as const
export type AlertFrequency = (typeof ALERT_FREQUENCIES)[number]

export const DEFAULT_ALERT_FREQUENCY: AlertFrequency = "daily"

/**
 * Filter values that get serialized to/from the search URL. Keep these keys
 * identical to the query parameters used by `useFilterUrlState` so we can
 * re-hydrate a search by setting `window.location.search`.
 */
export interface SavedSearchFilters {
  readonly search: string
  readonly country_id: number | null
  readonly city_id: number | null
  readonly property_type: string
  readonly type_of_contract: string
  readonly rooms: string
  readonly bathrooms: string
  readonly min_price: string
  readonly max_price: string
  readonly area_min: string
  readonly area_max: string
  readonly year_built_min: string
  readonly year_built_max: string
  readonly keywords: string
  readonly sort: string
}

export const EMPTY_SAVED_SEARCH_FILTERS: SavedSearchFilters = {
  search: "",
  country_id: null,
  city_id: null,
  property_type: "",
  type_of_contract: "",
  rooms: "",
  bathrooms: "",
  min_price: "",
  max_price: "",
  area_min: "",
  area_max: "",
  year_built_min: "",
  year_built_max: "",
  keywords: "",
  sort: "created_at:desc",
}

export interface SavedSearch {
  readonly id: number
  readonly name: string
  readonly filters: SavedSearchFilters
  readonly alert_enabled: boolean
  readonly alert_frequency: AlertFrequency
  readonly new_matches_count: number
  readonly last_match_at?: string | null
  readonly created_at: string
  readonly updated_at?: string
}

export interface CreateSavedSearchRequest {
  readonly name: string
  readonly filters: SavedSearchFilters
  readonly alert_enabled?: boolean
  readonly alert_frequency?: AlertFrequency
}

export interface UpdateSavedSearchRequest {
  readonly name?: string
  readonly alert_enabled?: boolean
  readonly alert_frequency?: AlertFrequency
}

export interface SavedSearchesResponse {
  readonly data: readonly SavedSearch[]
}

export const SAVED_SEARCH_NAME_MAX = 80

export function isEmptyFilters(filters: SavedSearchFilters): boolean {
  return (
    !filters.search &&
    filters.country_id == null &&
    filters.city_id == null &&
    !filters.property_type &&
    !filters.type_of_contract &&
    !filters.rooms &&
    !filters.bathrooms &&
    !filters.min_price &&
    !filters.max_price &&
    !filters.area_min &&
    !filters.area_max &&
    !filters.year_built_min &&
    !filters.year_built_max &&
    !filters.keywords
  )
}

export function filtersToQuery(filters: SavedSearchFilters): string {
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
  if (filters.area_min) params.set("area_min", filters.area_min)
  if (filters.area_max) params.set("area_max", filters.area_max)
  if (filters.year_built_min) params.set("year_built_min", filters.year_built_min)
  if (filters.year_built_max) params.set("year_built_max", filters.year_built_max)
  if (filters.keywords) params.set("keywords", filters.keywords)
  if (filters.sort && filters.sort !== "created_at:desc") params.set("sort", filters.sort)
  return params.toString()
}

export function filtersFromQuery(query: string): SavedSearchFilters {
  const params = new URLSearchParams(query)
  const num = (key: string): number | null => {
    const v = params.get(key)
    return v ? Number(v) : null
  }
  return {
    search: params.get("search") ?? "",
    country_id: num("country_id"),
    city_id: num("city_id"),
    property_type: params.get("property_type") ?? "",
    type_of_contract: params.get("type_of_contract") ?? "",
    rooms: params.get("rooms") ?? "",
    bathrooms: params.get("bathrooms") ?? "",
    min_price: params.get("min_price") ?? "",
    max_price: params.get("max_price") ?? "",
    area_min: params.get("area_min") ?? "",
    area_max: params.get("area_max") ?? "",
    year_built_min: params.get("year_built_min") ?? "",
    year_built_max: params.get("year_built_max") ?? "",
    keywords: params.get("keywords") ?? "",
    sort: params.get("sort") ?? "created_at:desc",
  }
}