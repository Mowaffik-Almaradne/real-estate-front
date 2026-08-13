import { describe, it, expect } from "vitest"
import {
  getRentalCardLabel,
  rentalCardStatusLabel,
} from "./labels"

describe("rental cards module-local labels", () => {
  it("returns English label when locale is en", () => {
    expect(getRentalCardLabel("en", "rentalCards.title")).toBe("Rental Cards")
  })

  it("returns Arabic label when locale is ar", () => {
    expect(getRentalCardLabel("ar", "rentalCards.title")).toBe("بطاقات الإيجار")
  })

  it("falls back to English for unknown locales", () => {
    expect(getRentalCardLabel("fr", "rentalCards.title")).toBe("Rental Cards")
  })

  it("falls back to key when missing", () => {
    expect(getRentalCardLabel("en", "rentalCards.unknown.key")).toBe(
      "rentalCards.unknown.key"
    )
  })

  it("substitutes variables", () => {
    expect(
      getRentalCardLabel("en", "rentalCards.permission.denied", {
        permission: "rental_cards.list",
      })
    ).toContain("rental_cards.list")
  })

  it("labels known statuses in English and Arabic", () => {
    expect(rentalCardStatusLabel("en", "active")).toBe("Active")
    expect(rentalCardStatusLabel("ar", "active")).toBe("نشط")
    expect(rentalCardStatusLabel("en", "renewed")).toBe("Renewed")
    expect(rentalCardStatusLabel("ar", "renewed")).toBe("مجددة")
  })

  it("returns raw status for unknown values", () => {
    expect(rentalCardStatusLabel("en", "nope")).toBe("nope")
    expect(rentalCardStatusLabel("en", null)).toBe("")
  })
})
