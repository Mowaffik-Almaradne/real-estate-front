import { describe, it, expect, vi, beforeEach } from "vitest"

const postMock = vi.fn()

vi.mock("@/lib/apiClient", async () => {
  const actual = await vi.importActual<typeof import("@/lib/apiClient")>("@/lib/apiClient")
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: (...args: unknown[]) => postMock(...args),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { aiService, isAiRateLimited } from "./aiService"

describe("aiService.search", () => {
  beforeEach(() => postMock.mockReset())

  it("posts query and normalizes array response", async () => {
    postMock.mockResolvedValue({
      data: {
        success: true,
        data: [
          { id: 1, title: "A", property_id: 1 },
          { id: 2, title: "B", property_id: 2 },
        ],
      },
    })
    const result = await aiService.search({ query: "furnished apartment" })
    expect(postMock).toHaveBeenCalledWith(
      "/ai/search",
      expect.objectContaining({ query: "furnished apartment" })
    )
    expect(result.results).toHaveLength(2)
    expect(result.total).toBe(2)
  })

  it("normalizes results.data wrapper", async () => {
    postMock.mockResolvedValue({
      data: {
        success: true,
        data: { results: [{ id: 1 }, { id: 2 }], total: 5 },
      },
    })
    const result = await aiService.search({ query: "anything here" })
    expect(result.results).toHaveLength(2)
    expect(result.total).toBe(5)
  })

  it("normalizes matches key", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { matches: [{ id: 1 }] } },
    })
    const result = await aiService.search({ query: "anything here" })
    expect(result.results).toHaveLength(1)
  })

  it("returns empty when no data", async () => {
    postMock.mockResolvedValue({ data: { success: true, data: null } })
    const result = await aiService.search({ query: "anything here" })
    expect(result.results).toEqual([])
  })
})

describe("aiService.generateDescription", () => {
  beforeEach(() => postMock.mockReset())

  it("posts empty body without language", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { description: "A spacious villa." } },
    })
    await aiService.generateDescription()
    expect(postMock).toHaveBeenCalledWith("/ai/description/generate", {})
  })

  it("posts language when provided", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { description: "X" } },
    })
    await aiService.generateDescription({ language: "ar" })
    expect(postMock).toHaveBeenCalledWith(
      "/ai/description/generate",
      expect.objectContaining({ language: "ar" })
    )
  })

  it("extracts description and alternatives", async () => {
    postMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          description: "main",
          alternatives: ["alt1", "alt2"],
        },
      },
    })
    const result = await aiService.generateDescription({ language: "en" })
    expect(result.description).toBe("main")
    expect(result.alternatives).toEqual(["alt1", "alt2"])
  })
})

describe("aiService.improveDescription", () => {
  beforeEach(() => postMock.mockReset())

  it("uses API improved_description when present", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { improved_description: "better text" } },
    })
    const result = await aiService.improveDescription({
      description: "old",
    })
    expect(result.improved_description).toBe("better text")
  })

  it("falls back to original description when API returns none", async () => {
    postMock.mockResolvedValue({ data: { success: true, data: {} } })
    const result = await aiService.improveDescription({
      description: "old text",
    })
    expect(result.improved_description).toBe("old text")
  })

  it("extracts notes", async () => {
    postMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          improved_description: "x",
          notes: ["note1", "note2"],
        },
      },
    })
    const result = await aiService.improveDescription({ description: "x" })
    expect(result.notes).toEqual(["note1", "note2"])
  })
})

describe("aiService.suggestTitles", () => {
  beforeEach(() => postMock.mockReset())

  it("posts empty body without language", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: ["Title 1", "Title 2"] },
    })
    const result = await aiService.suggestTitles()
    expect(postMock).toHaveBeenCalledWith("/ai/description/suggest-title", {})
    expect(result.titles).toEqual(["Title 1", "Title 2"])
  })

  it("normalizes object response", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { titles: ["A", "B"], language: "en" } },
    })
    const result = await aiService.suggestTitles({ language: "en" })
    expect(result.titles).toEqual(["A", "B"])
    expect(result.language).toBe("en")
  })

  it("normalizes objects with text fields", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: [{ text: "A" }, { text: "B" }] },
    })
    const result = await aiService.suggestTitles()
    expect(result.titles).toEqual(["A", "B"])
  })
})

describe("aiService.suggestFeatures", () => {
  beforeEach(() => postMock.mockReset())

  it("requires property_type in payload", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: ["Pool", "Garden"] },
    })
    await aiService.suggestFeatures({ property_type: "villa" })
    expect(postMock).toHaveBeenCalledWith(
      "/ai/description/suggest-features",
      expect.objectContaining({ property_type: "villa" })
    )
  })

  it("includes language when provided", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: ["مسبح"] },
    })
    await aiService.suggestFeatures({ property_type: "villa", language: "ar" })
    expect(postMock).toHaveBeenCalledWith(
      "/ai/description/suggest-features",
      expect.objectContaining({ property_type: "villa", language: "ar" })
    )
  })

  it("normalizes features list", async () => {
    postMock.mockResolvedValue({
      data: {
        success: true,
        data: { features: ["Pool", "Garden"] },
      },
    })
    const result = await aiService.suggestFeatures({ property_type: "villa" })
    expect(result.features).toEqual(["Pool", "Garden"])
  })
})

describe("isAiRateLimited", () => {
  it("returns true for 429 status", async () => {
    const { ApiClientError } = await import("@/lib/apiClient")
    const error = new ApiClientError(429, "Too Many Requests")
    expect(isAiRateLimited(error)).toBe(true)
  })

  it("returns true for throttled message", async () => {
    const { ApiClientError } = await import("@/lib/apiClient")
    const error = new ApiClientError(503, "Service throttled")
    expect(isAiRateLimited(error)).toBe(true)
  })

  it("returns false for other errors", async () => {
    const { ApiClientError } = await import("@/lib/apiClient")
    const error = new ApiClientError(500, "Internal Server Error")
    expect(isAiRateLimited(error)).toBe(false)
  })
})
