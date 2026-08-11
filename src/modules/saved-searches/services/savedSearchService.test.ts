import { describe, it, expect, vi, beforeEach } from "vitest"
import { savedSearchService } from "../services/savedSearchService"
import { EMPTY_SAVED_SEARCH_FILTERS, type SavedSearch } from "../types"

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  ApiClientError: class extends Error {},
}))

function makeSavedSearch(overrides: Partial<SavedSearch> = {}): SavedSearch {
  return {
    id: 1,
    name: "Apartments in Riyadh",
    filters: { ...EMPTY_SAVED_SEARCH_FILTERS, search: "Riyadh" },
    alert_enabled: true,
    alert_frequency: "daily",
    new_matches_count: 0,
    last_match_at: null,
    created_at: "2026-08-11T10:00:00Z",
    updated_at: "2026-08-11T10:00:00Z",
    ...overrides,
  }
}

describe("savedSearchService", () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
  })

  describe("list", () => {
    it("returns array from { data: [] } response", async () => {
      const items = [makeSavedSearch({ id: 1 }), makeSavedSearch({ id: 2, name: "Villas" })]
      mockGet.mockResolvedValueOnce({ data: { data: items } })
      const result = await savedSearchService.list()
      expect(mockGet).toHaveBeenCalledWith("/saved-searches")
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
    })

    it("returns array from bare array response", async () => {
      const items = [makeSavedSearch()]
      mockGet.mockResolvedValueOnce({ data: items })
      const result = await savedSearchService.list()
      expect(result).toHaveLength(1)
    })

    it("returns empty array when payload missing", async () => {
      mockGet.mockResolvedValueOnce({ data: null })
      const result = await savedSearchService.list()
      expect(result).toEqual([])
    })
  })

  describe("create", () => {
    it("POSTs to /saved-searches and unwraps data", async () => {
      const created = makeSavedSearch({ id: 42, name: "Houses" })
      mockPost.mockResolvedValueOnce({ data: { data: created } })
      const result = await savedSearchService.create({
        name: "Houses",
        filters: EMPTY_SAVED_SEARCH_FILTERS,
        alert_enabled: true,
        alert_frequency: "instant",
      })
      expect(mockPost).toHaveBeenCalledWith("/saved-searches", {
        name: "Houses",
        filters: EMPTY_SAVED_SEARCH_FILTERS,
        alert_enabled: true,
        alert_frequency: "instant",
      })
      expect(result.id).toBe(42)
    })

    it("accepts bare-object response", async () => {
      const created = makeSavedSearch({ id: 7 })
      mockPost.mockResolvedValueOnce({ data: created })
      const result = await savedSearchService.create({
        name: "test",
        filters: EMPTY_SAVED_SEARCH_FILTERS,
      })
      expect(result.id).toBe(7)
    })
  })

  describe("update", () => {
    it("PATCHes /saved-searches/{id} and unwraps data", async () => {
      const updated = makeSavedSearch({ id: 5, alert_enabled: false })
      mockPatch.mockResolvedValueOnce({ data: { data: updated } })
      const result = await savedSearchService.update(5, { alert_enabled: false })
      expect(mockPatch).toHaveBeenCalledWith("/saved-searches/5", { alert_enabled: false })
      expect(result.alert_enabled).toBe(false)
    })
  })

  describe("remove", () => {
    it("DELETEs /saved-searches/{id}", async () => {
      mockDelete.mockResolvedValueOnce({})
      await savedSearchService.remove(9)
      expect(mockDelete).toHaveBeenCalledWith("/saved-searches/9")
    })
  })
})