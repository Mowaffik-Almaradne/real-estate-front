import { describe, it, expect } from "vitest"
import {
  createRentalCardSchema,
  endRentalCardSchema,
  renewRentalCardSchema,
  rentalCardFiltersSchema,
  updateRentalCardSchema,
} from "./schemas"

const FUTURE_START = (() => {
  const now = new Date()
  now.setDate(now.getDate() + 7)
  return now.toISOString().slice(0, 10)
})()
const FUTURE_END = (() => {
  const now = new Date()
  now.setDate(now.getDate() + 30)
  return now.toISOString().slice(0, 10)
})()
const PAST_START = (() => {
  const now = new Date()
  now.setDate(now.getDate() - 5)
  return now.toISOString().slice(0, 10)
})()
const TODAY = (() => {
  const now = new Date()
  return now.toISOString().slice(0, 10)
})()

describe("createRentalCardSchema", () => {
  it("accepts a registered tenant", () => {
    const result = createRentalCardSchema.safeParse({
      property_id: 5,
      tenant_mode: "registered",
      tenant_user_id: 42,
      start_date: FUTURE_START,
      end_date: FUTURE_END,
      is_renewable: true,
      pre_rental_photos: [],
    })
    expect(result.success).toBe(true)
  })

  it("accepts an external tenant", () => {
    const result = createRentalCardSchema.safeParse({
      property_id: 5,
      tenant_mode: "external",
      external_tenant_name: "John External",
      external_tenant_phone: "+966500000000",
      start_date: FUTURE_START,
      end_date: FUTURE_END,
      pre_rental_photos: [],
    })
    expect(result.success).toBe(true)
  })

  it("rejects when neither tenant nor external name is provided", () => {
    const result = createRentalCardSchema.safeParse({
      property_id: 5,
      tenant_mode: "registered",
      start_date: FUTURE_START,
      end_date: FUTURE_END,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.path.join("."))
      expect(messages).toContain("tenant_user_id")
    }
  })

  it("rejects end_date before start_date", () => {
    const result = createRentalCardSchema.safeParse({
      property_id: 5,
      tenant_mode: "external",
      external_tenant_name: "X",
      start_date: FUTURE_END,
      end_date: FUTURE_START,
      pre_rental_photos: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects start_date in the past", () => {
    const result = createRentalCardSchema.safeParse({
      property_id: 5,
      tenant_mode: "external",
      external_tenant_name: "X",
      start_date: PAST_START,
      end_date: FUTURE_END,
      pre_rental_photos: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid external email", () => {
    const result = createRentalCardSchema.safeParse({
      property_id: 5,
      tenant_mode: "external",
      external_tenant_name: "X",
      external_tenant_email: "not-an-email",
      start_date: FUTURE_START,
      end_date: FUTURE_END,
      pre_rental_photos: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects too many photos", () => {
    const file = new File(["x"], "x.png", { type: "image/png" })
    const files = Array.from({ length: 21 }, () => file)
    const result = createRentalCardSchema.safeParse({
      property_id: 5,
      tenant_mode: "external",
      external_tenant_name: "X",
      start_date: FUTURE_START,
      end_date: FUTURE_END,
      pre_rental_photos: files,
    })
    expect(result.success).toBe(false)
  })

  it("rejects too-large photos", () => {
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "big.png", {
      type: "image/png",
    })
    const result = createRentalCardSchema.safeParse({
      property_id: 5,
      tenant_mode: "external",
      external_tenant_name: "X",
      start_date: FUTURE_START,
      end_date: FUTURE_END,
      pre_rental_photos: [big],
    })
    expect(result.success).toBe(false)
  })

  it("rejects wrong mime types", () => {
    const file = new File(["x"], "doc.pdf", { type: "application/pdf" })
    const result = createRentalCardSchema.safeParse({
      property_id: 5,
      tenant_mode: "external",
      external_tenant_name: "X",
      start_date: FUTURE_START,
      end_date: FUTURE_END,
      pre_rental_photos: [file],
    })
    expect(result.success).toBe(false)
  })
})

describe("updateRentalCardSchema", () => {
  it("accepts only mutable fields", () => {
    const result = updateRentalCardSchema.safeParse({
      end_date: FUTURE_END,
      terms: "Updated",
      notes: "Note",
      is_renewable: true,
    })
    expect(result.success).toBe(true)
  })

  it("rejects immutable fields", () => {
    const result = updateRentalCardSchema.safeParse({
      property_id: 5,
      tenant_user_id: 1,
    })
    expect(result.success).toBe(false)
  })
})

describe("endRentalCardSchema", () => {
  it("accepts empty end reason and date", () => {
    const result = endRentalCardSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts today as ended_at", () => {
    const result = endRentalCardSchema.safeParse({
      ended_at: TODAY,
      end_reason: "Tenant moved",
    })
    expect(result.success).toBe(true)
  })

  it("rejects future ended_at", () => {
    const result = endRentalCardSchema.safeParse({ ended_at: FUTURE_END })
    expect(result.success).toBe(false)
  })
})

describe("renewRentalCardSchema", () => {
  it("requires end_date", () => {
    const result = renewRentalCardSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("accepts valid renewal", () => {
    const result = renewRentalCardSchema.safeParse({
      end_date: FUTURE_END,
      terms: "Renewed",
      notes: "ok",
    })
    expect(result.success).toBe(true)
  })
})

describe("rentalCardFiltersSchema", () => {
  it("accepts empty filters", () => {
    const result = rentalCardFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts valid status", () => {
    const result = rentalCardFiltersSchema.safeParse({ status: "active" })
    expect(result.success).toBe(true)
  })

  it("rejects unknown status", () => {
    const result = rentalCardFiltersSchema.safeParse({ status: "unknown" })
    expect(result.success).toBe(false)
  })

  it("rejects perPage above 100", () => {
    const result = rentalCardFiltersSchema.safeParse({ perPage: 200 })
    expect(result.success).toBe(false)
  })
})
