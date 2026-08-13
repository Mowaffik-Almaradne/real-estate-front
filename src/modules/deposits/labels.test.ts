import { describe, it, expect } from "vitest"
import {
  depositStatusLabel,
  getDepositLabel,
  paymentMethodLabel,
} from "./labels"

describe("deposits module-local labels", () => {
  it("returns English label", () => {
    expect(getDepositLabel("en", "deposits.title")).toBe("Deposits & Escrow")
  })

  it("returns Arabic label", () => {
    expect(getDepositLabel("ar", "deposits.title")).toBe("العربون / الضمان")
  })

  it("falls back to English for unknown locales", () => {
    expect(getDepositLabel("fr", "deposits.title")).toBe("Deposits & Escrow")
  })

  it("substitutes variables", () => {
    expect(
      getDepositLabel("en", "deposits.list.pagination.summary", {
        from: 1,
        to: 15,
        total: 30,
      })
    ).toBe("Showing 1–15 of 30")
  })

  it("status label lookup is bilingual", () => {
    expect(depositStatusLabel("en", "held")).toBe("Held")
    expect(depositStatusLabel("ar", "held")).toBe("محتجز")
  })

  it("unknown status falls back to raw value", () => {
    expect(depositStatusLabel("en", "ghost")).toBe("ghost")
    expect(depositStatusLabel("en", null)).toBe("")
  })

  it("payment method label lookup is bilingual", () => {
    expect(paymentMethodLabel("en", "balance")).toBe("Wallet balance")
    expect(paymentMethodLabel("ar", "stripe")).toBe("سترايب")
    expect(paymentMethodLabel("en", null)).toBe("—")
  })
})
