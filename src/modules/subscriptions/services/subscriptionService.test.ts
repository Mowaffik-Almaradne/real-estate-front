import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  adminSubscriptionFeatureService,
  adminSubscriptionPlanFeatureService,
  adminSubscriptionPlanService,
  subscriptionPlanService,
} from "./subscriptionService"

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
  getApiPagination: () => undefined,
  ApiClientError: class extends Error {},
}))

function makePlan(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "Pro Plan",
    slug: "pro-plan",
    description: "Pro features",
    price: 29.99,
    currency: "USD",
    duration_days: 30,
    is_active: true,
    sort_order: 1,
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00",
    features: [],
    feature_details: [],
    ...overrides,
  }
}

function makeFeature(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    name: "Advanced Analytics",
    slug: "advanced_analytics",
    type: "toggle",
    description: "Detailed analytics dashboard",
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00",
    ...overrides,
  }
}

describe("subscriptionPlanService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("listPublic", () => {
    it("GETs /plans and unwraps the data envelope", async () => {
      const plans = [makePlan(), makePlan({ id: 2, slug: "basic-plan" })]
      mockGet.mockResolvedValueOnce({ data: { data: plans } })
      const result = await subscriptionPlanService.listPublic()
      expect(mockGet).toHaveBeenCalledWith("/plans", { silent: true })
      expect(result).toEqual(plans)
    })

    it("returns an empty array when the payload is missing", async () => {
      mockGet.mockResolvedValueOnce({ data: {} })
      const result = await subscriptionPlanService.listPublic()
      expect(result).toEqual([])
    })
  })

  describe("getPublicById", () => {
    it("GETs /plans/{id} and returns the unwrapped plan", async () => {
      const plan = makePlan({ id: 42 })
      mockGet.mockResolvedValueOnce({ data: { data: plan } })
      const result = await subscriptionPlanService.getPublicById(42)
      expect(mockGet).toHaveBeenCalledWith("/plans/42", { silent: true })
      expect(result).toEqual(plan)
    })
  })
})

describe("adminSubscriptionPlanService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("list", () => {
    it("GETs /admin/subscription/plans with no params when filters are empty", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [makePlan()] } })
      await adminSubscriptionPlanService.list()
      expect(mockGet).toHaveBeenCalledWith("/admin/subscription/plans", {
        params: {},
      })
    })

    it("serializes the filters into request params", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await adminSubscriptionPlanService.list({
        search: "pro",
        is_active: true,
        page: 2,
        perPage: 25,
        sort_by: "price",
        sort_order: "asc",
      })
      const args = mockGet.mock.calls[0]
      const url = args[0]
      const params = (args[1] as { params: Record<string, unknown> }).params
      expect(url).toBe("/admin/subscription/plans")
      expect(params.search).toBe("pro")
      expect(params.is_active).toBe(1)
      expect(params.page).toBe(2)
      expect(params.perPage).toBe(25)
      expect(params.sort_by).toBe("price")
      expect(params.sort_order).toBe("asc")
    })
  })

  describe("create", () => {
    it("POSTs the payload to /admin/subscription/plans", async () => {
      const plan = makePlan()
      const payload = {
        name: "Pro Plan",
        slug: "pro-plan",
        price: 29.99,
        currency: "USD",
        duration_days: 30,
        description: "Pro features",
      }
      mockPost.mockResolvedValueOnce({ data: { data: plan } })
      const result = await adminSubscriptionPlanService.create(payload)
      expect(mockPost).toHaveBeenCalledWith(
        "/admin/subscription/plans",
        payload
      )
      expect(result).toEqual(plan)
    })
  })

  describe("update", () => {
    it("PATCHes the payload to /admin/subscription/plans/{id}", async () => {
      const plan = makePlan({ price: 19.99 })
      mockPatch.mockResolvedValueOnce({ data: { data: plan } })
      const result = await adminSubscriptionPlanService.update(5, { price: 19.99 })
      expect(mockPatch).toHaveBeenCalledWith(
        "/admin/subscription/plans/5",
        { price: 19.99 }
      )
      expect(result).toEqual(plan)
    })
  })

  describe("remove", () => {
    it("DELETEs /admin/subscription/plans/{id}", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await adminSubscriptionPlanService.remove(8)
      expect(mockDelete).toHaveBeenCalledWith(
        "/admin/subscription/plans/8"
      )
    })
  })

  describe("syncFeatures", () => {
    it("POSTs the feature payload to /admin/subscription/plans/{id}/features", async () => {
      const plan = makePlan()
      mockPost.mockResolvedValueOnce({ data: { data: plan } })
      const payload = {
        features: [
          { feature_id: 10, is_enabled: true, limit_value: 5 },
          { feature_id: 11, limit_value: 10 },
        ],
      }
      const result = await adminSubscriptionPlanService.syncFeatures(7, payload)
      expect(mockPost).toHaveBeenCalledWith(
        "/admin/subscription/plans/7/features",
        payload
      )
      expect(result).toEqual(plan)
    })
  })
})

describe("adminSubscriptionFeatureService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("create", () => {
    it("POSTs to /admin/subscription/features", async () => {
      const feature = makeFeature()
      const payload = {
        name: "Advanced Analytics",
        slug: "advanced_analytics",
        type: "toggle" as const,
        description: "Detailed analytics dashboard",
      }
      mockPost.mockResolvedValueOnce({ data: { data: feature } })
      const result = await adminSubscriptionFeatureService.create(payload)
      expect(mockPost).toHaveBeenCalledWith(
        "/admin/subscription/features",
        payload
      )
      expect(result).toEqual(feature)
    })
  })

  describe("update", () => {
    it("PATCHes to /admin/subscription/features/{id}", async () => {
      const feature = makeFeature({ description: "Updated" })
      mockPatch.mockResolvedValueOnce({ data: { data: feature } })
      const result = await adminSubscriptionFeatureService.update(3, {
        description: "Updated",
      })
      expect(mockPatch).toHaveBeenCalledWith(
        "/admin/subscription/features/3",
        { description: "Updated" }
      )
      expect(result).toEqual(feature)
    })
  })

  describe("remove", () => {
    it("DELETEs /admin/subscription/features/{id}", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await adminSubscriptionFeatureService.remove(9)
      expect(mockDelete).toHaveBeenCalledWith(
        "/admin/subscription/features/9"
      )
    })
  })

  describe("list filters", () => {
    it("forwards filters as request params", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await adminSubscriptionFeatureService.list({
        search: "analytics",
        type: "limit",
        page: 1,
        perPage: 50,
      })
      const args = mockGet.mock.calls[0]
      const params = (args[1] as { params: Record<string, unknown> }).params
      expect(params.search).toBe("analytics")
      expect(params.type).toBe("limit")
      expect(params.page).toBe(1)
      expect(params.perPage).toBe(50)
    })
  })
})

describe("adminSubscriptionPlanFeatureService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("create", () => {
    it("POSTs to /admin/subscription/plan-features", async () => {
      const link = {
        id: 1,
        plan_id: 2,
        feature_id: 3,
        is_enabled: true,
        limit_value: 5,
      }
      mockPost.mockResolvedValueOnce({ data: { data: link } })
      const result = await adminSubscriptionPlanFeatureService.create({
        plan_id: 2,
        feature_id: 3,
        is_enabled: true,
        limit_value: 5,
      })
      expect(mockPost).toHaveBeenCalledWith(
        "/admin/subscription/plan-features",
        {
          plan_id: 2,
          feature_id: 3,
          is_enabled: true,
          limit_value: 5,
        }
      )
      expect(result).toEqual(link)
    })
  })

  describe("update", () => {
    it("PATCHes /admin/subscription/plan-features/{id}", async () => {
      const link = { id: 1, plan_id: 2, feature_id: 3, is_enabled: false, limit_value: null }
      mockPatch.mockResolvedValueOnce({ data: { data: link } })
      const result = await adminSubscriptionPlanFeatureService.update(1, {
        is_enabled: false,
      })
      expect(mockPatch).toHaveBeenCalledWith(
        "/admin/subscription/plan-features/1",
        { is_enabled: false }
      )
      expect(result).toEqual(link)
    })
  })

  describe("remove", () => {
    it("DELETEs /admin/subscription/plan-features/{id}", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await adminSubscriptionPlanFeatureService.remove(4)
      expect(mockDelete).toHaveBeenCalledWith(
        "/admin/subscription/plan-features/4"
      )
    })
  })
})
