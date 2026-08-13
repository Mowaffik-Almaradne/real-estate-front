import { describe, it, expect, vi, beforeEach } from "vitest"
import { analyticsService } from "../services/analyticsService"
import type { AnalyticsSummary } from "../types"

const mockGet = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T } | T
    if (payload && typeof payload === "object" && "data" in (payload as object)) {
      return (payload as { data: T }).data
    }
    return payload as T
  },
  ApiClientError: class extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
    isNotFound() {
      return this.status === 404
    }
    isForbidden() {
      return this.status === 403
    }
    isUnauthorized() {
      return this.status === 401
    }
  },
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
    source: "advanced",
  }
}

describe("analyticsService", () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it("uses /publisher/analytics only when advanced_analytics is enabled", async () => {
    const summary = makeSummary()
    mockGet
      .mockResolvedValueOnce({ data: { data: { enabled: true } } })
      .mockResolvedValueOnce({ data: { data: summary } })

    const result = await analyticsService.getOwnerSummary("7d")
    expect(mockGet).toHaveBeenNthCalledWith(1, "/subscription/features/advanced_analytics", {
      params: undefined,
      silent: true,
    })
    expect(mockGet).toHaveBeenNthCalledWith(2, "/publisher/analytics", {
      params: { range: "7d" },
      silent: true,
    })
    expect(result?.total_views).toBe(1200)
    expect(result?.source).toBe("advanced")
  })

  it("skips analytics + trader routes and uses basic publisher statistics", async () => {
    mockGet
      .mockResolvedValueOnce({ data: { data: { enabled: false } } })
      .mockResolvedValueOnce({
        data: { data: { views: 10, favorites: 4, contacts: 2 } },
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 9, name: "Loft", views: 10, favorites: 4, status: "approved" }],
        },
      })

    const result = await analyticsService.getOwnerSummary("30d")
    const urls = mockGet.mock.calls.map((call) => call[0])
    expect(urls).toEqual([
      "/subscription/features/advanced_analytics",
      "/publisher/statistics",
      "/dashboard/my-properties",
    ])
    expect(result?.source).toBe("basic")
    expect(result?.total_views).toBe(10)
    expect(result?.top_properties[0]?.id).toBe(9)
  })

  it("defaults range to 30d for advanced analytics", async () => {
    mockGet
      .mockResolvedValueOnce({ data: { data: { enabled: true } } })
      .mockResolvedValueOnce({ data: makeSummary() })
    await analyticsService.getOwnerSummary()
    expect(mockGet).toHaveBeenCalledWith("/publisher/analytics", {
      params: { range: "30d" },
      silent: true,
    })
  })

  it("uses documented OpenAPI analytics endpoints only", async () => {
    /**
     * Contract: docs/backend/new-api-documentation/openapi.yaml
     *   /api/subscription/features/{slug}
     *   /api/publisher/analytics
     *   /api/publisher/statistics
     * /dashboard/my-properties is a legacy publisher fallback and not part
     * of the new analytics contract; it is preserved as a defensive source.
     */
    mockGet
      .mockResolvedValueOnce({ data: { data: { enabled: true } } })
      .mockResolvedValueOnce({ data: makeSummary() })
    await analyticsService.getOwnerSummary("12m", 42)
    const urls = mockGet.mock.calls.map((call) => call[0])
    expect(urls).toEqual([
      "/subscription/features/advanced_analytics",
      "/publisher/analytics",
    ])
    expect(mockGet).toHaveBeenLastCalledWith("/publisher/analytics", {
      params: { range: "12m", property_id: 42 },
      silent: true,
    })
  })
})
