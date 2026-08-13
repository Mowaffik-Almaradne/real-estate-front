import { describe, it, expect } from "vitest"
import {
  cancelDepositSchema,
  createDepositSchema,
  depositFiltersSchema,
  payDepositSchema,
  refundDepositSchema,
  releaseDepositSchema,
  updateDepositSchema,
} from "./schemas"

describe("createDepositSchema", () => {
  it("accepts valid input", () => {
    const result = createDepositSchema.safeParse({
      property_id: 5,
      seller_id: 7,
      amount: 1500,
      currency: "SAR",
      terms: "Refundable upon inspection",
      notes: "Initial",
    })
    expect(result.success).toBe(true)
  })

  it("defaults currency to SAR", () => {
    const result = createDepositSchema.safeParse({
      property_id: 5,
      seller_id: 7,
      amount: 1500,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.currency).toBe("SAR")
    }
  })

  it("accepts string amounts (coerced to number)", () => {
    const result = createDepositSchema.safeParse({
      property_id: 5,
      seller_id: 7,
      amount: "1500.5",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amount).toBe(1500.5)
    }
  })

  it("rejects zero amount", () => {
    const result = createDepositSchema.safeParse({
      property_id: 5,
      seller_id: 7,
      amount: 0,
    })
    expect(result.success).toBe(false)
  })

  it("rejects negative amount", () => {
    const result = createDepositSchema.safeParse({
      property_id: 5,
      seller_id: 7,
      amount: -10,
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing property", () => {
    const result = createDepositSchema.safeParse({
      seller_id: 7,
      amount: 10,
    })
    expect(result.success).toBe(false)
  })

  it("rejects unknown currency", () => {
    const result = createDepositSchema.safeParse({
      property_id: 5,
      seller_id: 7,
      amount: 10,
      currency: "EUR",
    })
    expect(result.success).toBe(false)
  })
})

describe("updateDepositSchema", () => {
  it("accepts empty update", () => {
    const result = updateDepositSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("rejects non-positive amount", () => {
    const result = updateDepositSchema.safeParse({ amount: 0 })
    expect(result.success).toBe(false)
  })
})

describe("payDepositSchema", () => {
  it("accepts balance", () => {
    const result = payDepositSchema.safeParse({ payment_method: "balance" })
    expect(result.success).toBe(true)
  })

  it("accepts stripe", () => {
    const result = payDepositSchema.safeParse({ payment_method: "stripe" })
    expect(result.success).toBe(true)
  })

  it("rejects unknown payment method", () => {
    const result = payDepositSchema.safeParse({ payment_method: "paypal" })
    expect(result.success).toBe(false)
  })

  it("rejects missing payment method", () => {
    const result = payDepositSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe("releaseDepositSchema", () => {
  it("accepts empty notes", () => {
    const result = releaseDepositSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts notes", () => {
    const result = releaseDepositSchema.safeParse({ notes: "Released per agreement" })
    expect(result.success).toBe(true)
  })
})

describe("refundDepositSchema", () => {
  it("accepts empty", () => {
    const result = refundDepositSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe("cancelDepositSchema", () => {
  it("requires reason", () => {
    const result = cancelDepositSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("accepts reason", () => {
    const result = cancelDepositSchema.safeParse({ reason: "Buyer backed out" })
    expect(result.success).toBe(true)
  })
})

describe("depositFiltersSchema", () => {
  it("accepts empty filters", () => {
    const result = depositFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts known status", () => {
    const result = depositFiltersSchema.safeParse({ status: "held" })
    expect(result.success).toBe(true)
  })

  it("rejects unknown status", () => {
    const result = depositFiltersSchema.safeParse({ status: "unknown" })
    expect(result.success).toBe(false)
  })

  it("rejects perPage above 100", () => {
    const result = depositFiltersSchema.safeParse({ perPage: 200 })
    expect(result.success).toBe(false)
  })
})
