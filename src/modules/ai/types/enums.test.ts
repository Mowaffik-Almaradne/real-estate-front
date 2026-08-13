import { describe, it, expect } from "vitest"
import {
  AI_DESCRIPTION_LANGUAGES,
  AI_SEARCH_QUERY_MAX,
  AI_SEARCH_QUERY_MIN,
  isAiDescriptionLanguage,
} from "./enums"

describe("ai enums and helpers", () => {
  it("exposes supported languages", () => {
    expect(AI_DESCRIPTION_LANGUAGES).toEqual(["ar", "en"])
  })

  it("exposes query limits", () => {
    expect(AI_SEARCH_QUERY_MIN).toBe(5)
    expect(AI_SEARCH_QUERY_MAX).toBe(500)
  })

  it("isAiDescriptionLanguage narrows to supported values", () => {
    expect(isAiDescriptionLanguage("ar")).toBe(true)
    expect(isAiDescriptionLanguage("en")).toBe(true)
    expect(isAiDescriptionLanguage("fr")).toBe(false)
    expect(isAiDescriptionLanguage(null)).toBe(false)
    expect(isAiDescriptionLanguage(undefined)).toBe(false)
  })
})
