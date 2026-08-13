import { describe, it, expect } from "vitest"
import { getAiLabel } from "./labels"

describe("ai module-local labels", () => {
  it("returns English label", () => {
    expect(getAiLabel("en", "ai.title")).toBe("AI tools")
  })

  it("returns Arabic label", () => {
    expect(getAiLabel("ar", "ai.title")).toBe("أدوات الذكاء الاصطناعي")
  })

  it("falls back to English for unknown locales", () => {
    expect(getAiLabel("fr", "ai.title")).toBe("AI tools")
  })

  it("falls back to key when missing", () => {
    expect(getAiLabel("en", "ai.unknown.key")).toBe("ai.unknown.key")
  })

  it("substitutes variables", () => {
    expect(
      getAiLabel("en", "ai.search.results.summary", { total: 3 })
    ).toBe("Found 3 match(es) for your query.")
  })

  it("substitutes variables with Arabic template", () => {
    expect(
      getAiLabel("ar", "ai.search.results.summary", { total: 5 })
    ).toBe("تم العثور على 5 نتيجة مطابقة.")
  })
})
