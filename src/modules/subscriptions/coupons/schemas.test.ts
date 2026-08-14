import { describe, expect, it } from "vitest"
import {
  subscriptionDiscountFormSchema,
  validateCouponRequestSchema,
} from "./schemas"

describe("subscriptionDiscountFormSchema", () => {
  it("accepts a complete payload", () => {
    const result = subscriptionDiscountFormSchema.safeParse({
      code: "SUMMER20",
      type: "percentage",
      value: 20,
      plan_id: null,
      max_uses: 100,
      expires_at: null,
      is_active: true,
    })
    expect(result.success).toBe(true)
  })

  it("rejects a negative value", () => {
    const result = subscriptionDiscountFormSchema.safeParse({
      code: "BAD",
      type: "percentage",
      value: -1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects codes with spaces", () => {
    const result = subscriptionDiscountFormSchema.safeParse({
      code: "summer 20",
      type: "percentage",
      value: 10,
    })
    expect(result.success).toBe(false)
  })

  it("rejects unsupported discount types", () => {
    const result = subscriptionDiscountFormSchema.safeParse({
      code: "BAD",
      type: "weird",
      value: 10,
    })
    expect(result.success).toBe(false)
  })
})

describe("validateCouponRequestSchema", () => {
  it("accepts a code", () => {
    expect(
      validateCouponRequestSchema.safeParse({ code: "SUMMER20" }).success
    ).toBe(true)
  })

  it("requires a code", () => {
    expect(validateCouponRequestSchema.safeParse({ code: "" }).success).toBe(false)
  })
})
