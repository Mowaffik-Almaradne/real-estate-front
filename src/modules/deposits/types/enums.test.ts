import { describe, it, expect } from "vitest"
import {
  canCancelDeposit,
  canDeleteDeposit,
  canPayDeposit,
  canRefundDeposit,
  canReleaseDeposit,
  canUpdateDeposit,
  DepositCurrency,
  DepositStatus,
  isDisputedDeposit,
  isHeldDeposit,
  isPendingDeposit,
  isTerminalDepositStatus,
  PAYMENT_METHODS,
  PaymentMethod,
} from "./enums"

describe("deposit enums and helpers", () => {
  it("exposes the six backend statuses", () => {
    expect(Object.values(DepositStatus)).toEqual([
      "pending",
      "held",
      "released",
      "refunded",
      "disputed",
      "cancelled",
    ])
  })

  it("exposes SAR and USD currencies", () => {
    expect(Object.values(DepositCurrency)).toEqual(["SAR", "USD"])
  })

  it("exposes balance and stripe payment methods", () => {
    expect(Object.values(PaymentMethod)).toEqual(["balance", "stripe"])
    expect(PAYMENT_METHODS).toEqual(["balance", "stripe"])
  })

  it("isPendingDeposit matches only pending", () => {
    expect(isPendingDeposit(DepositStatus.pending)).toBe(true)
    expect(isPendingDeposit(DepositStatus.held)).toBe(false)
  })

  it("isHeldDeposit matches only held", () => {
    expect(isHeldDeposit(DepositStatus.held)).toBe(true)
    expect(isHeldDeposit(DepositStatus.disputed)).toBe(false)
  })

  it("isDisputedDeposit matches only disputed", () => {
    expect(isDisputedDeposit(DepositStatus.disputed)).toBe(true)
    expect(isDisputedDeposit(DepositStatus.held)).toBe(false)
  })

  it("isTerminalDepositStatus matches terminal statuses only", () => {
    expect(isTerminalDepositStatus(DepositStatus.released)).toBe(true)
    expect(isTerminalDepositStatus(DepositStatus.refunded)).toBe(true)
    expect(isTerminalDepositStatus(DepositStatus.cancelled)).toBe(true)
    expect(isTerminalDepositStatus(DepositStatus.pending)).toBe(false)
    expect(isTerminalDepositStatus(DepositStatus.held)).toBe(false)
    expect(isTerminalDepositStatus(DepositStatus.disputed)).toBe(false)
  })

  it("canPayDeposit only on pending", () => {
    expect(canPayDeposit(DepositStatus.pending)).toBe(true)
    expect(canPayDeposit(DepositStatus.held)).toBe(false)
  })

  it("canCancelDeposit on pending and disputed only", () => {
    expect(canCancelDeposit(DepositStatus.pending)).toBe(true)
    expect(canCancelDeposit(DepositStatus.disputed)).toBe(true)
    expect(canCancelDeposit(DepositStatus.held)).toBe(false)
    expect(canCancelDeposit(DepositStatus.released)).toBe(false)
  })

  it("canReleaseDeposit and canRefundDeposit on held and disputed", () => {
    expect(canReleaseDeposit(DepositStatus.held)).toBe(true)
    expect(canReleaseDeposit(DepositStatus.disputed)).toBe(true)
    expect(canReleaseDeposit(DepositStatus.pending)).toBe(false)
    expect(canRefundDeposit(DepositStatus.held)).toBe(true)
    expect(canRefundDeposit(DepositStatus.disputed)).toBe(true)
    expect(canRefundDeposit(DepositStatus.pending)).toBe(false)
  })

  it("canUpdateDeposit only on pending", () => {
    expect(canUpdateDeposit(DepositStatus.pending)).toBe(true)
    expect(canUpdateDeposit(DepositStatus.held)).toBe(false)
  })

  it("canDeleteDeposit excludes held, disputed, released", () => {
    expect(canDeleteDeposit(DepositStatus.pending)).toBe(true)
    expect(canDeleteDeposit(DepositStatus.refunded)).toBe(true)
    expect(canDeleteDeposit(DepositStatus.cancelled)).toBe(true)
    expect(canDeleteDeposit(DepositStatus.held)).toBe(false)
    expect(canDeleteDeposit(DepositStatus.disputed)).toBe(false)
    expect(canDeleteDeposit(DepositStatus.released)).toBe(false)
  })
})
