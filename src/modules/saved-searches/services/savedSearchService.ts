import { ApiClientError } from "@/lib/apiClient"
import type {
  CreateSavedSearchRequest,
  SavedSearch,
  UpdateSavedSearchRequest,
} from "../types"
import { DEFAULT_ALERT_FREQUENCY } from "../types"

export { ApiClientError as SavedSearchServiceError }

/**
 * Saved-search CRUD is not present in OpenAPI / the local backend
 * (`GET /api/saved-searches` → 404). Persist in localStorage until the API exists.
 */
const STORAGE_KEY = "re:saved-searches:v1"

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function readAll(): SavedSearch[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as SavedSearch[]) : []
  } catch {
    return []
  }
}

function writeAll(items: SavedSearch[]): void {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota / private-mode failures
  }
}

function nextId(items: SavedSearch[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export const savedSearchService = {
  async list(): Promise<SavedSearch[]> {
    return readAll()
  },

  async create(request: CreateSavedSearchRequest): Promise<SavedSearch> {
    const items = readAll()
    const now = new Date().toISOString()
    const created: SavedSearch = {
      id: nextId(items),
      name: request.name,
      filters: request.filters,
      alert_enabled: request.alert_enabled ?? true,
      alert_frequency: request.alert_frequency ?? DEFAULT_ALERT_FREQUENCY,
      new_matches_count: 0,
      last_match_at: null,
      created_at: now,
      updated_at: now,
    }
    writeAll([created, ...items])
    return created
  },

  async update(id: number, request: UpdateSavedSearchRequest): Promise<SavedSearch> {
    const items = readAll()
    const index = items.findIndex((item) => item.id === id)
    if (index < 0) {
      throw new ApiClientError(404, "Saved search not found")
    }
    const current = items[index]
    const updated: SavedSearch = {
      ...current,
      ...request,
      id: current.id,
      filters: current.filters,
      updated_at: new Date().toISOString(),
    }
    const next = [...items]
    next[index] = updated
    writeAll(next)
    return updated
  },

  async remove(id: number): Promise<void> {
    writeAll(readAll().filter((item) => item.id !== id))
  },
}
