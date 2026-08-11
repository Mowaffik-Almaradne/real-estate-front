import type {
  AmortizationRow,
  MortgageInputs,
  MortgageResult,
} from "./types"

/**
 * Standard mortgage monthly payment formula:
 *   M = P * (r(1+r)^n) / ((1+r)^n - 1)
 * where:
 *   P = principal
 *   r = monthly interest rate (annual / 12 / 100)
 *   n = total number of payments (years * 12)
 */
export function calculateMortgage({
  principal,
  annualRate,
  termYears,
}: MortgageInputs): MortgageResult {
  const months = Math.max(0, Math.round(termYears * 12))
  const principalClamped = Math.max(0, principal)
  if (months === 0 || principalClamped === 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalCost: principalClamped,
      numberOfPayments: months,
    }
  }

  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) {
    const payment = principalClamped / months
    return {
      monthlyPayment: payment,
      totalInterest: 0,
      totalCost: principalClamped,
      numberOfPayments: months,
    }
  }

  const factor = Math.pow(1 + monthlyRate, months)
  const monthlyPayment = (principalClamped * monthlyRate * factor) / (factor - 1)
  const totalCost = monthlyPayment * months
  const totalInterest = totalCost - principalClamped
  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    numberOfPayments: months,
  }
}

/**
 * Produces a per-month amortization schedule for the given inputs.
 * Optionally caps the number of rows returned for performance.
 */
export function buildAmortizationSchedule(
  inputs: MortgageInputs,
  maxRows?: number
): AmortizationRow[] {
  const result = calculateMortgage(inputs)
  const { monthlyPayment, numberOfPayments } = result
  if (monthlyPayment === 0 || numberOfPayments === 0) return []

  const monthlyRate = inputs.annualRate / 100 / 12
  const rows: AmortizationRow[] = []
  let remaining = inputs.principal
  const cap = maxRows !== undefined ? Math.min(maxRows, numberOfPayments) : numberOfPayments

  for (let month = 1; month <= cap; month++) {
    const interest = remaining * monthlyRate
    let principalPaid = monthlyPayment - interest
    if (month === cap) {
      principalPaid = remaining
    }
    remaining = Math.max(0, remaining - principalPaid)
    rows.push({
      month,
      payment: month === cap ? principalPaid + interest : monthlyPayment,
      interest,
      principal: principalPaid,
      remainingBalance: remaining,
    })
  }
  return rows
}

/**
 * Converts a numeric string (possibly localized) into a positive number.
 * Returns 0 for invalid input.
 *
 * Supports `1,234.56` (US-style), `1.234,56` (EU-style), and plain `1234`.
 */
export function parsePositiveNumber(value: string): number {
  if (!value) return 0
  // Negative values are treated as invalid input (return 0).
  if (/^-/.test(value.trim())) return 0
  const cleaned = value.replace(/[^\d.,]/g, "")
  const hasComma = cleaned.includes(",")
  const hasDot = cleaned.includes(".")
  let normalized = cleaned
  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",")
    const lastDot = cleaned.lastIndexOf(".")
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".")
    } else {
      normalized = cleaned.replace(/,/g, "")
    }
  } else if (hasComma) {
    normalized = cleaned.replace(",", ".")
  }
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

/**
 * Clamps a number between `min` and `max`.
 */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}