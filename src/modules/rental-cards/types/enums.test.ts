import { describe, it, expect } from "vitest"
import {
  canCreateRenewal,
  canDeleteRentalCard,
  canEditRentalCard,
  canEndRentalCard,
  canRenewRentalCard,
  isActiveRentalCardStatus,
  RentalCardStatus,
} from "./enums"

describe("rental card enums and helpers", () => {
  it("exposes the four backend statuses", () => {
    expect(Object.values(RentalCardStatus)).toEqual([
      "active",
      "ended",
      "cancelled",
      "renewed",
    ])
  })

  it("flags only active rentals as active", () => {
    expect(isActiveRentalCardStatus(RentalCardStatus.active)).toBe(true)
    expect(isActiveRentalCardStatus(RentalCardStatus.ended)).toBe(false)
    expect(isActiveRentalCardStatus(RentalCardStatus.cancelled)).toBe(false)
    expect(isActiveRentalCardStatus(RentalCardStatus.renewed)).toBe(false)
  })

  it("only allows ending active rentals", () => {
    expect(canEndRentalCard(RentalCardStatus.active)).toBe(true)
    expect(canEndRentalCard(RentalCardStatus.ended)).toBe(false)
    expect(canEndRentalCard(RentalCardStatus.renewed)).toBe(false)
    expect(canEndRentalCard(RentalCardStatus.cancelled)).toBe(false)
  })

  it("requires renewable flag for renew", () => {
    expect(canRenewRentalCard(RentalCardStatus.active, true)).toBe(true)
    expect(canRenewRentalCard(RentalCardStatus.active, false)).toBe(false)
    expect(canRenewRentalCard(RentalCardStatus.ended, true)).toBe(false)
    expect(canCreateRenewal(RentalCardStatus.active, true)).toBe(true)
    expect(canCreateRenewal(RentalCardStatus.active, undefined)).toBe(false)
  })

  it("only allows deleting non-active rentals", () => {
    expect(canDeleteRentalCard(RentalCardStatus.active)).toBe(false)
    expect(canDeleteRentalCard(RentalCardStatus.ended)).toBe(true)
    expect(canDeleteRentalCard(RentalCardStatus.cancelled)).toBe(true)
    expect(canDeleteRentalCard(RentalCardStatus.renewed)).toBe(true)
  })

  it("blocks editing cancelled cards", () => {
    expect(canEditRentalCard(RentalCardStatus.cancelled)).toBe(false)
    expect(canEditRentalCard(RentalCardStatus.active)).toBe(true)
    expect(canEditRentalCard(RentalCardStatus.ended)).toBe(true)
  })
})
