import { describe, expect, it } from "vitest"
import {
  subscriptionFeatureFormSchema,
  subscriptionPlanFormSchema,
} from "./schemas"

describe("subscriptionPlanFormSchema", () => {
  it("accepts a complete payload", () => {
    const result = subscriptionPlanFormSchema.safeParse({
      name: "Pro Plan",
      slug: "pro-plan",
      description: "Best plan",
      price: 29.99,
      currency: "USD",
      duration_days: 30,
      is_active: true,
      sort_order: 1,
    })
    expect(result.success).toBe(true)
  })

  it("rejects a missing name", () => {
    const result = subscriptionPlanFormSchema.safeParse({
      name: "",
      slug: "pro",
      price: 10,
      duration_days: 30,
    })
    expect(result.success).toBe(false)
  })

  it("rejects a price lower than 0", () => {
    const result = subscriptionPlanFormSchema.safeParse({
      name: "Bad",
      slug: "bad",
      price: -1,
      duration_days: 30,
    })
    expect(result.success).toBe(false)
  })

  it("rejects a duration of 0 days", () => {
    const result = subscriptionPlanFormSchema.safeParse({
      name: "Bad",
      slug: "bad",
      price: 10,
      duration_days: 0,
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid slugs", () => {
    const result = subscriptionPlanFormSchema.safeParse({
      name: "Bad",
      slug: "bad slug with spaces",
      price: 10,
      duration_days: 30,
    })
    expect(result.success).toBe(false)
  })

  it("rejects currency longer than 3 chars", () => {
    const result = subscriptionPlanFormSchema.safeParse({
      name: "Bad",
      slug: "bad",
      price: 10,
      duration_days: 30,
      currency: "USDD",
    })
    expect(result.success).toBe(false)
  })
})

describe("subscriptionFeatureFormSchema", () => {
  it("accepts a toggle feature", () => {
    const result = subscriptionFeatureFormSchema.safeParse({
      name: "Advanced Analytics",
      slug: "advanced_analytics",
      type: "toggle",
      description: "Detailed analytics",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an unsupported feature type", () => {
    const result = subscriptionFeatureFormSchema.safeParse({
      name: "Bad",
      slug: "bad",
      type: "unknown",
    })
    expect(result.success).toBe(false)
  })
})
