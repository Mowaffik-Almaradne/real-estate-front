import { describe, it, expect, vi, beforeEach } from "vitest"
import { subscriptionLifecycleService } from "./service"

const mockGet = vi.fn()
const mockPost = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T } | null | undefined
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload.data ?? null) as T
    }
    return (response.data as T) ?? null
  },
  getApiPagination: () => undefined,
  ApiClientError: class extends Error {},
}))

function makeSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    plan_id: 10,
    status: "active",
    remaining_days: 28,
    starts_at: "2026-01-01 00:00:00",
    ends_at: "2026-01-31 00:00:00",
    cancelled_at: null,
    features: [],
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00",
    ...overrides,
  }
}

describe("subscriptionLifecycleService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getCurrent", () => {
    it("GETs /subscription/current and returns the unwrapped subscription", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: makeSubscription() } })
      const result = await subscriptionLifecycleService.getCurrent()
      expect(mockGet).toHaveBeenCalledWith("/subscription/current", {
        silent: true,
      })
      expect(result).toEqual(makeSubscription())
    })

    it("returns null when the user has no current subscription", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: null } })
      const result = await subscriptionLifecycleService.getCurrent()
      expect(result).toBeNull()
    })
  })

  describe("getHistory", () => {
    it("GETs /subscription/history and returns the array", async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [makeSubscription({ id: 2 }), makeSubscription({ id: 3 })] },
      })
      const result = await subscriptionLifecycleService.getHistory()
      expect(mockGet).toHaveBeenCalledWith("/subscription/history", {
        silent: true,
      })
      expect(result).toHaveLength(2)
    })

    it("returns an empty array when the payload is missing", async () => {
      mockGet.mockResolvedValueOnce({ data: {} })
      const result = await subscriptionLifecycleService.getHistory()
      expect(result).toEqual([])
    })
  })

  describe("cancel", () => {
    it("POSTs an empty body to /subscription/cancel", async () => {
      const response = {
        cancelled: true,
        subscription: makeSubscription({ status: "cancelled" }),
        message: "Auto-renew cancelled.",
      }
      mockPost.mockResolvedValueOnce({ data: { data: response } })
      const result = await subscriptionLifecycleService.cancel()
      expect(mockPost).toHaveBeenCalledWith("/subscription/cancel", {})
      expect(result).toEqual(response)
    })
  })

  describe("getFeatures", () => {
    it("GETs /subscription/features and returns the array", async () => {
      const features = [
        {
          id: 1,
          name: "Featured Property",
          slug: "featured_property",
          type: "toggle",
          description: null,
          is_enabled: true,
          limit_value: null,
        },
      ]
      mockGet.mockResolvedValueOnce({ data: { data: features } })
      const result = await subscriptionLifecycleService.getFeatures()
      expect(mockGet).toHaveBeenCalledWith("/subscription/features", {
        silent: true,
      })
      expect(result).toEqual(features)
    })
  })

  describe("checkFeature", () => {
    it("GETs /subscription/features/{slug} and returns the unwrapped feature", async () => {
      const feature = {
        id: 1,
        name: "Featured Property",
        slug: "featured_property",
        type: "toggle",
        description: null,
        is_enabled: true,
        limit_value: null,
      }
      mockGet.mockResolvedValueOnce({ data: { data: feature } })
      const result =
        await subscriptionLifecycleService.checkFeature("featured_property")
      expect(mockGet).toHaveBeenCalledWith(
        "/subscription/features/featured_property",
        { silent: true }
      )
      expect(result).toEqual(feature)
    })

    it("returns null when the feature is unavailable", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: null } })
      const result =
        await subscriptionLifecycleService.checkFeature("missing_feature")
      expect(result).toBeNull()
    })

    it("URL-encodes the slug for paths with special characters", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: null } })
      await subscriptionLifecycleService.checkFeature("some/slug value")
      expect(mockGet).toHaveBeenCalledWith(
        "/subscription/features/some%2Fslug%20value",
        { silent: true }
      )
    })
  })

  describe("getStatusLogs", () => {
    it("GETs /subscription/{id}/status-logs and returns the array", async () => {
      const logs = [
        {
          id: 1,
          subscription_id: 7,
          from_status: null,
          to_status: "pending",
          notes: "Awaiting payment",
          actor_id: null,
          created_at: "2026-01-01 00:00:00",
          updated_at: "2026-01-01 00:00:00",
        },
      ]
      mockGet.mockResolvedValueOnce({ data: { data: logs } })
      const result = await subscriptionLifecycleService.getStatusLogs(7)
      expect(mockGet).toHaveBeenCalledWith(
        "/subscription/7/status-logs",
        { silent: true }
      )
      expect(result).toEqual(logs)
    })
  })
})
