import { describe, it, expect } from "vitest"
import {
  aiGenerateSchema,
  aiImproveSchema,
  aiSearchSchema,
  aiSuggestFeaturesSchema,
  aiSuggestTitleSchema,
} from "./schemas"

describe("aiSearchSchema", () => {
  it("accepts a valid query", () => {
    const result = aiSearchSchema.safeParse({ query: "furnished apartment" })
    expect(result.success).toBe(true)
  })

  it("rejects too short", () => {
    const result = aiSearchSchema.safeParse({ query: "hi" })
    expect(result.success).toBe(false)
  })

  it("rejects too long", () => {
    const result = aiSearchSchema.safeParse({ query: "a".repeat(501) })
    expect(result.success).toBe(false)
  })
})

describe("aiGenerateSchema", () => {
  it("accepts no language", () => {
    const result = aiGenerateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts ar", () => {
    const result = aiGenerateSchema.safeParse({ language: "ar" })
    expect(result.success).toBe(true)
  })

  it("rejects unknown language", () => {
    const result = aiGenerateSchema.safeParse({ language: "fr" })
    expect(result.success).toBe(false)
  })
})

describe("aiImproveSchema", () => {
  it("requires description", () => {
    const result = aiImproveSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("accepts description", () => {
    const result = aiImproveSchema.safeParse({ description: "Spacious apartment" })
    expect(result.success).toBe(true)
  })
})

describe("aiSuggestTitleSchema", () => {
  it("accepts empty", () => {
    const result = aiSuggestTitleSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe("aiSuggestFeaturesSchema", () => {
  it("requires property_type", () => {
    const result = aiSuggestFeaturesSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("accepts property_type with optional language", () => {
    const result = aiSuggestFeaturesSchema.safeParse({
      property_type: "villa",
      language: "en",
    })
    expect(result.success).toBe(true)
  })

  it("rejects unknown language", () => {
    const result = aiSuggestFeaturesSchema.safeParse({
      property_type: "villa",
      language: "fr",
    })
    expect(result.success).toBe(false)
  })
})
