import { describe, it, expect } from "vitest"

import {
  buildAmortizationSchedule,
  calculateMortgage,
  clamp,
  parsePositiveNumber,
} from "./mortgageCalc"

describe("calculateMortgage", () => {
  it("computes the canonical 30-year $200k @ 5% example", () => {
    const result = calculateMortgage({
      principal: 200_000,
      annualRate: 5,
      termYears: 30,
    })
    // Reference value from standard mortgage calculators: $1,073.64
    expect(result.numberOfPayments).toBe(360)
    expect(result.monthlyPayment).toBeCloseTo(1073.64, 1)
    expect(result.totalCost).toBeCloseTo(result.monthlyPayment * 360, 2)
    expect(result.totalInterest).toBeGreaterThan(180_000)
    expect(result.totalInterest).toBeLessThan(195_000)
  })

  it("handles zero interest by dividing principal evenly", () => {
    const result = calculateMortgage({
      principal: 120_000,
      annualRate: 0,
      termYears: 10,
    })
    expect(result.monthlyPayment).toBe(1000)
    expect(result.totalInterest).toBe(0)
    expect(result.totalCost).toBe(120_000)
  })

  it("handles zero principal", () => {
    const result = calculateMortgage({
      principal: 0,
      annualRate: 4.5,
      termYears: 25,
    })
    expect(result.monthlyPayment).toBe(0)
    expect(result.totalCost).toBe(0)
    expect(result.totalInterest).toBe(0)
    expect(result.numberOfPayments).toBe(300)
  })

  it("handles zero term", () => {
    const result = calculateMortgage({
      principal: 100_000,
      annualRate: 4.5,
      termYears: 0,
    })
    expect(result.numberOfPayments).toBe(0)
    expect(result.monthlyPayment).toBe(0)
  })

  it("clamps negative principal to zero", () => {
    const result = calculateMortgage({
      principal: -100,
      annualRate: 4,
      termYears: 10,
    })
    expect(result.monthlyPayment).toBe(0)
    expect(result.totalCost).toBe(0)
  })

  it("produces higher payment for higher rate", () => {
    const a = calculateMortgage({ principal: 100_000, annualRate: 3, termYears: 20 })
    const b = calculateMortgage({ principal: 100_000, annualRate: 7, termYears: 20 })
    expect(b.monthlyPayment).toBeGreaterThan(a.monthlyPayment)
  })
})

describe("buildAmortizationSchedule", () => {
  it("produces rows that sum to total cost", () => {
    const rows = buildAmortizationSchedule({
      principal: 100_000,
      annualRate: 5,
      termYears: 30,
    })
    expect(rows).toHaveLength(360)
    const total = rows.reduce((sum, row) => sum + row.payment, 0)
    const expected = calculateMortgage({
      principal: 100_000,
      annualRate: 5,
      termYears: 30,
    }).totalCost
    expect(total).toBeCloseTo(expected, 0)
  })

  it("returns empty array for zero principal", () => {
    expect(
      buildAmortizationSchedule({ principal: 0, annualRate: 5, termYears: 30 })
    ).toEqual([])
  })

  it("respects maxRows cap", () => {
    const rows = buildAmortizationSchedule(
      { principal: 100_000, annualRate: 5, termYears: 30 },
      12
    )
    expect(rows).toHaveLength(12)
    expect(rows[0].month).toBe(1)
    expect(rows[11].month).toBe(12)
  })

  it("final row remaining balance is zero", () => {
    const rows = buildAmortizationSchedule({
      principal: 50_000,
      annualRate: 4,
      termYears: 10,
    })
    expect(rows[rows.length - 1].remainingBalance).toBeCloseTo(0, 5)
  })
})

describe("parsePositiveNumber", () => {
  it("parses plain numbers", () => {
    expect(parsePositiveNumber("1234")).toBe(1234)
  })

  it("parses localized decimals", () => {
    expect(parsePositiveNumber("1,234.56")).toBe(1234.56)
    expect(parsePositiveNumber("1.234,56")).toBe(1234.56)
  })

  it("returns 0 for invalid input", () => {
    expect(parsePositiveNumber("")).toBe(0)
    expect(parsePositiveNumber("abc")).toBe(0)
    expect(parsePositiveNumber("-5")).toBe(0)
  })
})

describe("clamp", () => {
  it("returns value when in range", () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it("returns min when below", () => {
    expect(clamp(-1, 0, 10)).toBe(0)
  })

  it("returns max when above", () => {
    expect(clamp(20, 0, 10)).toBe(10)
  })
})