"use client"

import { useCallback, useMemo, useState } from "react"

import {
  DEFAULT_DOWN_PAYMENT_PERCENT,
  DEFAULT_INTEREST_RATE,
  DEFAULT_TERM_YEARS,
  type MortgageCalculatorState,
} from "./types"
import { calculateMortgage, clamp } from "./mortgageCalc"

const MIN_RATE = 0
const MAX_RATE = 25
const MIN_TERM = 1
const MAX_TERM = 40

export interface UseMortgageResult {
  state: MortgageCalculatorState
  setPropertyPrice: (value: number) => void
  setDownPayment: (value: number) => void
  setDownPaymentPercent: (percent: number) => void
  setAnnualRate: (value: number) => void
  setTermYears: (value: number) => void
  reset: () => void
  result: ReturnType<typeof calculateMortgage>
  loanPrincipal: number
}

export function useMortgage(
  initialPrice: number
): UseMortgageResult {
  const initialDownPayment = (initialPrice * DEFAULT_DOWN_PAYMENT_PERCENT) / 100

  const [state, setState] = useState<MortgageCalculatorState>(() => ({
    propertyPrice: initialPrice,
    downPayment: initialDownPayment,
    principal: initialPrice - initialDownPayment,
    annualRate: DEFAULT_INTEREST_RATE,
    termYears: DEFAULT_TERM_YEARS,
  }))

  const setPropertyPrice = useCallback((value: number) => {
    setState((prev) => {
      const next = Math.max(0, value)
      const downPayment = clamp(
        prev.downPayment,
        0,
        Math.max(0, next)
      )
      return {
        ...prev,
        propertyPrice: next,
        downPayment,
        principal: Math.max(0, next - downPayment),
      }
    })
  }, [])

  const setDownPayment = useCallback((value: number) => {
    setState((prev) => {
      const downPayment = clamp(value, 0, prev.propertyPrice)
      return {
        ...prev,
        downPayment,
        principal: Math.max(0, prev.propertyPrice - downPayment),
      }
    })
  }, [])

  const setDownPaymentPercent = useCallback((percent: number) => {
    setState((prev) => {
      const safePercent = clamp(percent, 0, 100)
      const downPayment = (prev.propertyPrice * safePercent) / 100
      return {
        ...prev,
        downPayment,
        principal: Math.max(0, prev.propertyPrice - downPayment),
      }
    })
  }, [])

  const setAnnualRate = useCallback((value: number) => {
    setState((prev) => ({
      ...prev,
      annualRate: clamp(value, MIN_RATE, MAX_RATE),
    }))
  }, [])

  const setTermYears = useCallback((value: number) => {
    setState((prev) => ({
      ...prev,
      termYears: clamp(Math.round(value), MIN_TERM, MAX_TERM),
    }))
  }, [])

  const reset = useCallback(() => {
    const price = initialPrice
    const downPayment = (price * DEFAULT_DOWN_PAYMENT_PERCENT) / 100
    setState({
      propertyPrice: price,
      downPayment,
      principal: price - downPayment,
      annualRate: DEFAULT_INTEREST_RATE,
      termYears: DEFAULT_TERM_YEARS,
    })
  }, [initialPrice])

  const result = useMemo(
    () =>
      calculateMortgage({
        principal: state.principal,
        annualRate: state.annualRate,
        termYears: state.termYears,
      }),
    [state.principal, state.annualRate, state.termYears]
  )

  return {
    state,
    setPropertyPrice,
    setDownPayment,
    setDownPaymentPercent,
    setAnnualRate,
    setTermYears,
    reset,
    result,
    loanPrincipal: state.principal,
  }
}