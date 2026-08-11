import { describe, it, expect } from "vitest"
import { isLocale, locales, defaultLocale, rtlLocales } from "@/i18n/config"
import en from "@/messages/en.json"
import ar from "@/messages/ar.json"

describe("i18n request config", () => {
  it("exposes en and ar as the supported locales", () => {
    expect(locales).toEqual(["en", "ar"])
  })

  it("uses en as the default locale", () => {
    expect(defaultLocale).toBe("en")
  })

  it("treats ar as an RTL locale", () => {
    expect(rtlLocales.has("ar")).toBe(true)
    expect(rtlLocales.has("en")).toBe(false)
  })

  describe("isLocale", () => {
    it("returns true for known locales", () => {
      expect(isLocale("en")).toBe(true)
      expect(isLocale("ar")).toBe(true)
    })

    it("returns false for unknown locales", () => {
      expect(isLocale("fr")).toBe(false)
      expect(isLocale("EN")).toBe(false)
      expect(isLocale("")).toBe(false)
    })

    it("returns false for nullish values", () => {
      expect(isLocale(undefined)).toBe(false)
      expect(isLocale(null)).toBe(false)
    })
  })
})

function collectKeys(value: unknown, prefix = ""): string[] {
  if (value === null || value === undefined || typeof value !== "object") {
    return prefix ? [prefix] : []
  }
  const out: string[] = []
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out.push(...collectKeys(v, key))
    } else {
      out.push(key)
    }
  }
  return out
}

describe("message catalogs", () => {
  const enKeys = new Set(collectKeys(en))
  const arKeys = new Set(collectKeys(ar))

  it("en and ar have the same key set", () => {
    const enOnly = [...enKeys].filter((k) => !arKeys.has(k))
    const arOnly = [...arKeys].filter((k) => !enKeys.has(k))
    expect(enOnly).toEqual([])
    expect(arOnly).toEqual([])
  })

  it("no message key is empty in either locale", () => {
    for (const [namespace, values] of Object.entries(en)) {
      for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
        expect(value, `en.${namespace}.${key} should not be empty`).toBeTruthy()
      }
    }
    for (const [namespace, values] of Object.entries(ar)) {
      for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
        expect(value, `ar.${namespace}.${key} should not be empty`).toBeTruthy()
      }
    }
  })

  it("includes the expected top-level namespaces", () => {
    const expected = [
      "nav",
      "common",
      "brand",
      "sidebar",
      "header",
      "home",
      "auth",
      "property",
      "viewing",
      "chat",
      "notification",
      "city",
      "dashboard",
      "settings",
      "status",
    ]
    for (const ns of expected) {
      expect(en).toHaveProperty(ns)
      expect(ar).toHaveProperty(ns)
    }
  })

  it("navigation labels are translated (not identical between locales)", () => {
    expect(en.nav.home).not.toBe(ar.nav.home)
    expect(en.nav.properties).not.toBe(ar.nav.properties)
    expect(en.nav.dashboard).not.toBe(ar.nav.dashboard)
  })
})
