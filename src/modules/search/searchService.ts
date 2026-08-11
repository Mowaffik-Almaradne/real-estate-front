import { propertyService } from "src/modules/properties/services/propertyService"
import { MAX_RECENT_SEARCHES, type RecentSearch, type SearchSuggestion } from "./types"

const STORAGE_KEY = "search:recent:v1"

function readStorage(): RecentSearch[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((entry): entry is RecentSearch =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as RecentSearch).query === "string"
      )
      .slice(0, MAX_RECENT_SEARCHES)
  } catch {
    return []
  }
}

function writeStorage(items: RecentSearch[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Returns the most recent saved searches (newest first).
 */
export function loadRecentSearches(): RecentSearch[] {
  return readStorage()
}

/**
 * Adds `query` to the top of the recent searches list. Duplicates are removed.
 */
export function pushRecentSearch(query: string): RecentSearch[] {
  const trimmed = query.trim()
  if (!trimmed) return loadRecentSearches()
  const filtered = readStorage().filter(
    (entry) => entry.query.toLowerCase() !== trimmed.toLowerCase()
  )
  const next: RecentSearch[] = [
    { query: trimmed, timestamp: Date.now() },
    ...filtered,
  ].slice(0, MAX_RECENT_SEARCHES)
  writeStorage(next)
  return next
}

/**
 * Removes a specific query from the recent searches list.
 */
export function removeRecentSearch(query: string): RecentSearch[] {
  const next = readStorage().filter(
    (entry) => entry.query.toLowerCase() !== query.toLowerCase()
  )
  writeStorage(next)
  return next
}

/**
 * Clears all recent searches.
 */
export function clearRecentSearches(): void {
  writeStorage([])
}

/**
 * Fetches a small list of matching properties to be used as autocomplete suggestions.
 * Returns at most `MAX_SUGGESTIONS` items, or `[]` if the query is empty.
 */
export async function fetchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const trimmed = query.trim()
  if (!trimmed) return []
  try {
    const response = await propertyService.getProperties({
      search: trimmed,
      page: 1,
      perPage: 8,
    })
    return response.data.slice(0, 6).map((p) => ({
      id: p.id,
      name: p.name,
      city: p.city?.name ?? "",
      country: p.country?.name ?? "",
      type: p.property_type,
      formattedPrice: p.formatted_price,
      mainImage: p.main_image_thumb || p.main_image || null,
    }))
  } catch {
    return []
  }
}