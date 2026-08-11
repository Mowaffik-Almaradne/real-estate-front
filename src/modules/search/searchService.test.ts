import { describe, it, expect, beforeEach, vi } from "vitest"

import {
  clearRecentSearches,
  fetchSuggestions,
  loadRecentSearches,
  pushRecentSearch,
  removeRecentSearch,
} from "./searchService"

vi.mock("src/modules/properties/services/propertyService", () => ({
  propertyService: {
    getProperties: vi.fn(async ({ search }: { search?: string }) => {
      if (!search) return { data: [], pagination: {} }
      return {
        data: [
          {
            id: 1,
            name: `Sample ${search}`,
            city: { name: "Casablanca" },
            country: { name: "Morocco" },
            property_type: "apartment",
            formatted_price: "100,000 MAD",
            main_image_thumb: null,
            main_image: null,
            is_favorited: false,
            favorites_count: 0,
            price: "100000",
            area: "120",
            rooms: 3,
            bathrooms: 2,
            status: "approved",
            type_of_contract: "sale",
            publisher: { id: 1, name: "P", is_verified: false, publisher_type: "individual" },
          },
        ],
        pagination: {},
      }
    }),
  },
}))

describe("searchService", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("loadRecentSearches returns [] initially", () => {
    expect(loadRecentSearches()).toEqual([])
  })

  it("pushRecentSearch stores a new entry", () => {
    pushRecentSearch("villa casablanca")
    const items = loadRecentSearches()
    expect(items).toHaveLength(1)
    expect(items[0].query).toBe("villa casablanca")
    expect(typeof items[0].timestamp).toBe("number")
  })

  it("pushRecentSearch deduplicates (case-insensitive) and pushes to top", () => {
    pushRecentSearch("villa")
    pushRecentSearch("apartment")
    pushRecentSearch("VILLA")
    const items = loadRecentSearches()
    expect(items).toHaveLength(2)
    expect(items[0].query.toLowerCase()).toBe("villa")
  })

  it("pushRecentSearch ignores empty strings", () => {
    pushRecentSearch("   ")
    expect(loadRecentSearches()).toEqual([])
  })

  it("pushRecentSearch truncates to MAX_RECENT_SEARCHES", () => {
    for (let i = 0; i < 12; i++) pushRecentSearch(`query-${i}`)
    const items = loadRecentSearches()
    expect(items.length).toBeLessThanOrEqual(5)
  })

  it("removeRecentSearch drops the matching query", () => {
    pushRecentSearch("foo")
    pushRecentSearch("bar")
    removeRecentSearch("Foo")
    expect(loadRecentSearches().map((e) => e.query)).toEqual(["bar"])
  })

  it("clearRecentSearches empties storage", () => {
    pushRecentSearch("foo")
    clearRecentSearches()
    expect(loadRecentSearches()).toEqual([])
  })

  it("loadRecentSearches returns [] on malformed JSON", () => {
    window.localStorage.setItem("search:recent:v1", "{not-json")
    expect(loadRecentSearches()).toEqual([])
  })
})

describe("fetchSuggestions", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("returns [] when query is empty", async () => {
    expect(await fetchSuggestions("")).toEqual([])
    expect(await fetchSuggestions("   ")).toEqual([])
  })

  it("maps property response to SearchSuggestion", async () => {
    const results = await fetchSuggestions("apartment")
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      id: 1,
      city: "Casablanca",
      country: "Morocco",
      type: "apartment",
      formattedPrice: "100,000 MAD",
      mainImage: null,
    })
  })
})