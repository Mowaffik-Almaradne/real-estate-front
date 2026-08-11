export interface MortgageInputs {
  /** Loan principal (after down payment). */
  principal: number
  /** Annual interest rate (percentage, e.g. 4.5). */
  annualRate: number
  /** Loan term in years. */
  termYears: number
}

export interface MortgageResult {
  monthlyPayment: number
  totalInterest: number
  totalCost: number
  /** Number of monthly payments over the loan term. */
  numberOfPayments: number
}

export interface AmortizationRow {
  month: number
  payment: number
  interest: number
  principal: number
  remainingBalance: number
}

export interface MortgageCalculatorState extends MortgageInputs {
  /** Down payment amount (absolute). */
  downPayment: number
  /** Property price (the loan principal is derived from this). */
  propertyPrice: number
}

export const DEFAULT_INTEREST_RATE = 4.5
export const DEFAULT_TERM_YEARS = 25
export const DEFAULT_DOWN_PAYMENT_PERCENT = 20
export const MAX_AMORTIZATION_ROWS = 360