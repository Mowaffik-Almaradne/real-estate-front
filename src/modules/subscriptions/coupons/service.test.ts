import { describe, it, expect, vi, beforeEach } from "vitest"
import { adminCouponService, couponService } from "./service"

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

function makeDiscount(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    code: "SUMMER20",
    type: "percentage",
    value: 20,
    plan_id: null,
    max_uses: 100,
    expires_at: null,
    is_active: true,
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00",
    ...overrides,
  }
}

describe("couponService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("POSTs the coupon code (and optional plan_id) to /coupons/validate", async () => {
    const response = {
      valid: true,
      code: "SUMMER20",
      discount_type: "percentage",
      discount_value: 20,
      discount_amount: 6,
      final_amount: 24,
      plan_id: 5,
      plan_price: 30,
    }
    mockPost.mockResolvedValueOnce({ data: { data: response } })
    const result = await couponService.validate({ code: "SUMMER20", plan_id: 5 })
    expect(mockPost).toHaveBeenCalledWith("/coupons/validate", {
      code: "SUMMER20",
      plan_id: 5,
    })
    expect(result).toEqual(response)
  })

  it("validates a coupon without a plan_id", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        data: { valid: true, code: "FALL10", discount_type: "percentage", discount_value: 10 },
      },
    })
    await couponService.validate({ code: "FALL10" })
    expect(mockPost).toHaveBeenCalledWith("/coupons/validate", {
      code: "FALL10",
      plan_id: undefined,
    })
  })
})

describe("adminCouponService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("list", () => {
    it("GETs /admin/subscription/discounts with no params when filters are empty", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await adminCouponService.list()
      expect(mockGet).toHaveBeenCalledWith("/admin/subscription/discounts", {
        params: {},
      })
    })

    it("serializes the filters into request params", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await adminCouponService.list({
        search: "summer",
        type: "fixed",
        is_active: true,
        plan_id: 4,
        page: 2,
        perPage: 25,
        sort_by: "code",
        sort_order: "desc",
      })
      const args = mockGet.mock.calls[0]
      const params = (args[1] as { params: Record<string, unknown> }).params
      expect(params.search).toBe("summer")
      expect(params.type).toBe("fixed")
      expect(params.is_active).toBe(1)
      expect(params.plan_id).toBe(4)
      expect(params.page).toBe(2)
      expect(params.perPage).toBe(25)
      expect(params.sort_by).toBe("code")
      expect(params.sort_order).toBe("desc")
    })
  })

  describe("getById", () => {
    it("GETs /admin/subscription/discounts/{id}", async () => {
      const discount = makeDiscount({ id: 9 })
      mockGet.mockResolvedValueOnce({ data: { data: discount } })
      const result = await adminCouponService.getById(9)
      expect(mockGet).toHaveBeenCalledWith("/admin/subscription/discounts/9")
      expect(result).toEqual(discount)
    })
  })

  describe("create", () => {
    it("POSTs the payload to /admin/subscription/discounts", async () => {
      const discount = makeDiscount()
      const payload = {
        code: "SUMMER20",
        type: "percentage" as const,
        value: 20,
        plan_id: null,
        max_uses: 100,
        expires_at: null,
        is_active: true,
      }
      mockPost.mockResolvedValueOnce({ data: { data: discount } })
      const result = await adminCouponService.create(payload)
      expect(mockPost).toHaveBeenCalledWith(
        "/admin/subscription/discounts",
        payload
      )
      expect(result).toEqual(discount)
    })
  })

  describe("update", () => {
    it("PATCHes the payload to /admin/subscription/discounts/{id}", async () => {
      const discount = makeDiscount({ value: 30 })
      mockPatch.mockResolvedValueOnce({ data: { data: discount } })
      const result = await adminCouponService.update(3, { value: 30 })
      expect(mockPatch).toHaveBeenCalledWith(
        "/admin/subscription/discounts/3",
        { value: 30 }
      )
      expect(result).toEqual(discount)
    })
  })

  describe("remove", () => {
    it("DELETEs /admin/subscription/discounts/{id}", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await adminCouponService.remove(6)
      expect(mockDelete).toHaveBeenCalledWith(
        "/admin/subscription/discounts/6"
      )
    })
  })
})
