import { describe, it, expect } from "vitest"
import { buildAbsoluteUrl, buildAlternates, buildCanonical } from "./seo"

describe("seo", () => {
  describe("buildAbsoluteUrl", () => {
    it("prefixes an absolute path with appUrl", () => {
      const url = buildAbsoluteUrl("/en/properties")
      expect(url).toMatch(/^https?:\/\/[^/]+\/en\/properties$/)
    })

    it("returns URLs unchanged when already absolute", () => {
      const url = buildAbsoluteUrl("https://example.com/foo")
      expect(url).toBe("https://example.com/foo")
    })
  })

  describe("buildCanonical", () => {
    it("returns root URL for /", () => {
      const url = buildCanonical("/", "en")
      expect(url).toMatch(/\/en$/)
    })

    it("returns locale-prefixed URL for paths", () => {
      const url = buildCanonical("/properties", "ar")
      expect(url).toMatch(/\/ar\/properties$/)
    })

    it("prefixes paths missing leading slash", () => {
      const url = buildCanonical("favorites", "en")
      expect(url).toMatch(/\/en\/favorites$/)
    })
  })

  describe("buildAlternates", () => {
    it("produces canonical and languages map including x-default", () => {
      const result = buildAlternates("/properties", "en")
      expect(result.canonical).toMatch(/\/en\/properties$/)
      expect(result.languages).toHaveProperty("en")
      expect(result.languages).toHaveProperty("ar")
      expect(result.languages).toHaveProperty("x-default")
    })

    it("returns language-specific URLs", () => {
      const result = buildAlternates("/properties", "ar")
      expect(result.languages.en).toMatch(/\/en\/properties$/)
      expect(result.languages.ar).toMatch(/\/ar\/properties$/)
    })

    it("uses root URL for /", () => {
      const result = buildAlternates("/", "en")
      expect(result.canonical).toMatch(/\/en$/)
      expect(result.languages.ar).toMatch(/\/ar$/)
    })
  })
})
