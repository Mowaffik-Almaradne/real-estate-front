import { describe, it, expect } from "vitest"
import {
  createCategorySchema,
  updateCategorySchema,
  categoryFiltersSchema,
} from "./schemas"

describe("categories schemas", () => {
  it("rejects category without name", () => {
    const result = createCategorySchema.safeParse({
      name: "",
      type: "property",
    })
    expect(result.success).toBe(false)
  })

  it("accepts a minimal valid category", () => {
    const result = createCategorySchema.safeParse({
      name: "Apartments",
      type: "property",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid type", () => {
    const result = createCategorySchema.safeParse({
      name: "Boats",
      type: "boat",
    })
    expect(result.success).toBe(false)
  })

  it("accepts an empty update payload", () => {
    const result = updateCategorySchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("filters search long input", () => {
    const result = categoryFiltersSchema.safeParse({
      search: "x".repeat(250),
    })
    expect(result.success).toBe(false)
  })

  it("accepts a valid filters payload", () => {
    const result = categoryFiltersSchema.safeParse({
      type: "car",
      search: "suv",
    })
    expect(result.success).toBe(true)
  })
})
