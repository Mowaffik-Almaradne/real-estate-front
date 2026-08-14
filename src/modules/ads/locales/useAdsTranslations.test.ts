import { describe, expect, it } from "vitest"
import { getAdsMessages } from "./useAdsTranslations"

function lookup(messages: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current == null || typeof current !== "object") return undefined
    return (current as Record<string, unknown>)[segment]
  }, messages)
}

describe("getAdsMessages", () => {
  it("resolves nested ads.groups keys instead of leaking the path", () => {
    const en = getAdsMessages("en")
    expect(lookup(en, "ads.groups.newGroup")).toBe("New group")
    expect(lookup(en, "ads.groups.form.validation.nameRequired")).toBe(
      "Name is required."
    )
    expect(lookup(en, "ads.status.draft")).toBe("Draft")
  })

  it("resolves Arabic ads.groups keys", () => {
    const ar = getAdsMessages("ar")
    expect(lookup(ar, "ads.groups.newGroup")).toBe("مجموعة جديدة")
  })
})
