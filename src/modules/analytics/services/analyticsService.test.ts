import { describe, it, expect, vi, beforeEach } from "vitest"
import { analyticsService } from "../services/analyticsService"
import type { AnalyticsSummary } from "../types"

const mockGet = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  ApiClientError: class extends Error {},
}))

function makeSummary(): AnalyticsSummary {
  return {
    range: "30d",
    from: "2026-07-12",
    to: "2026-08-11",
    total_views: 1200,
    total_contacts: 80,
    total_favorites: 240,
    total_viewings: 18,
    total_conversions: 12,
    conversion_rate: 6.5,
    views_change: 12.4,
    contacts_change: 6.1,
    favorites_change: 3.2,
    viewings_change: -1.5,
    series: [
      {
        metric: "views",
        total: 1200,
        previous_total: 1068,
        points: [
          { date: "2026-07-12", value: 40 },
          { date: "2026-08-11", value: 65 },
        ],
      },
    ],
    top_properties: [
      {
        id: 1,
        title: "Marina Apartment",
        views: 320,
        contacts: 24,
        favorites: 80,
        viewings: 6,
        status: "approved",
      },
    ],
  }
}

describe("analyticsService", () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it("GETs /analytics/owner/summary with range param", async () => {
    const summary = makeSummary()
    mockGet.mockResolvedValueOnce({ data: { data: summary } })
    const result = await analyticsService.getOwnerSummary("7d")
    expect(mockGet).toHaveBeenCalledWith("/analytics/owner/summary", {
      params: { range: "7d" },
    })
    expect(result).toEqual(summary)
  })

  it("includes property_id when provided", async () => {
    mockGet.mockResolvedValueOnce({ data: makeSummary() })
    await analyticsService.getOwnerSummary("30d", 42)
    expect(mockGet).toHaveBeenCalledWith("/analytics/owner/summary", {
      params: { range: "30d", property_id: 42 },
    })
  })

  it("returns null when payload missing", async () => {
    mockGet.mockResolvedValueOnce({ data: null })
    const result = await analyticsService.getOwnerSummary()
    expect(result).toBeNull()
  })

  it("accepts bare-object response", async () => {
    const summary = makeSummary()
    mockGet.mockResolvedValueOnce({ data: summary })
    const result = await analyticsService.getOwnerSummary()
    expect(result?.total_views).toBe(1200)
  })

  it("defaults range to 30d", async () => {
    mockGet.mockResolvedValueOnce({ data: makeSummary() })
    await analyticsService.getOwnerSummary()
    expect(mockGet).toHaveBeenCalledWith("/analytics/owner/summary", {
      params: { range: "30d" },
    })
  })
})