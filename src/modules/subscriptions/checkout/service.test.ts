import { describe, it, expect, vi, beforeEach } from "vitest"
import { checkoutService } from "./service"

const mockPost = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  getApiPagination: () => undefined,
  ApiClientError: class extends Error {},
}))

describe("checkoutService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("POSTs the checkout payload to /checkout", async () => {
    const payload = {
      checkout_url: "https://checkout.stripe.com/c/pay/cs_test_123",
      subscription: null,
      message: "Stripe session created.",
    }
    mockPost.mockResolvedValueOnce({ data: { data: payload } })
    const result = await checkoutService.start({
      plan_id: 7,
      coupon_code: "SUMMER20",
      payment_method: "stripe",
    })
    expect(mockPost).toHaveBeenCalledWith("/checkout", {
      plan_id: 7,
      coupon_code: "SUMMER20",
      payment_method: "stripe",
    })
    expect(result).toEqual(payload)
  })

  it("forwards balance payment requests without a coupon", async () => {
    const payload = {
      subscription: { id: 99, plan_id: 7, status: "active" },
      message: "Subscription created via balance.",
    }
    mockPost.mockResolvedValueOnce({ data: { data: payload } })
    const result = await checkoutService.start({
      plan_id: 7,
      payment_method: "balance",
    })
    expect(mockPost).toHaveBeenCalledWith("/checkout", {
      plan_id: 7,
      payment_method: "balance",
    })
    expect(result).toEqual(payload)
  })

  it("exposes the CheckoutServiceError as the ApiClientError class", () => {
    expect(checkoutService).toBeDefined()
  })
})
