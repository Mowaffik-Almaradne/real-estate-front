import { describe, it, expect } from "vitest"
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  statusLabel,
  statusTone,
  titleCase,
} from "./format"
import { PropertyStatus, ViewingStatus } from "@/types/enums"

describe("format utilities", () => {
  it("formats currency using the given currency code", () => {
    expect(formatCurrency(1500, "USD", "en-US")).toBe("$1,500.00")
    expect(formatCurrency("1234.5", "EUR", "en-US")).toBe("€1,234.50")
  })

  it("returns em-dash for missing currency", () => {
    expect(formatCurrency(null)).toBe("—")
    expect(formatCurrency(undefined)).toBe("—")
  })

  it("formats dates and datetimes", () => {
    const iso = "2026-01-15T10:30:00.000Z"
    expect(formatDate(iso, "en-US")).toMatch(/Jan/)
    expect(formatDate(iso, "en-US")).toMatch(/2026/)
    expect(formatDateTime(iso, "en-US")).toMatch(/\d{1,2}:\d{2}/)
  })

  it("returns em-dash for invalid dates", () => {
    expect(formatDate(null)).toBe("—")
    expect(formatDate("not-a-date")).toBe("—")
  })

  it("maps status values to human labels", () => {
    expect(statusLabel(PropertyStatus.under_inspection)).toBe("Under Inspection")
    expect(statusLabel(ViewingStatus.no_show)).toBe("No Show")
    expect(statusLabel("unknown_value")).toBe("Unknown Value")
  })

  it("maps status values to badge tones", () => {
    expect(statusTone(PropertyStatus.approved)).toBe("success")
    expect(statusTone(PropertyStatus.rejected)).toBe("destructive")
    expect(statusTone(PropertyStatus.pending)).toBe("warning")
    expect(statusTone("unknown")).toBe("default")
  })

  it("title-cases snake/kebab strings", () => {
    expect(titleCase("under_inspection")).toBe("Under Inspection")
    expect(titleCase("no-show")).toBe("No Show")
    expect(titleCase(null)).toBe("")
  })
})
