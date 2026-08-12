"use client"

import { Calculator, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"

import { useMortgage } from "../useMortgage"
import { clamp } from "../mortgageCalc"

interface MortgageCalculatorProps {
  initialPrice: number
  currencyLabel?: string
  className?: string
}

const MIN_RATE = 0
const MAX_RATE = 25
const MIN_TERM = 1
const MAX_TERM = 40
const MIN_DOWN_PERCENT = 0
const MAX_DOWN_PERCENT = 100

function formatCurrency(amount: number, locale: string): string {
  if (!Number.isFinite(amount)) return "—"
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return amount.toFixed(0)
  }
}

export function MortgageCalculator({
  initialPrice,
  currencyLabel,
  className,
}: MortgageCalculatorProps) {
  const t = useTranslations("mortgage")
  const locale =
    typeof document !== "undefined" ? document.documentElement.lang : "en"
  const { state, setPropertyPrice, setDownPaymentPercent, setAnnualRate, setTermYears, reset, result, loanPrincipal } =
    useMortgage(initialPrice)

  const downPercent = state.propertyPrice
    ? (state.downPayment / state.propertyPrice) * 100
    : 0

  return (
    <Card className={className} data-testid="mortgage-calculator">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="size-4 text-primary" aria-hidden="true" />
          {t("title")}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={reset}
          aria-label={t("reset")}
          title={t("reset")}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="mortgage-price">{t("price")}</Label>
          <Input
            id="mortgage-price"
            type="number"
            inputMode="decimal"
            min={0}
            value={state.propertyPrice || ""}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="mortgage-down">{t("downPayment")}</Label>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {downPercent.toFixed(0)}%
            </span>
          </div>
          <Input
            id="mortgage-down"
            type="range"
            min={MIN_DOWN_PERCENT}
            max={MAX_DOWN_PERCENT}
            step={1}
            value={Math.round(downPercent)}
            onChange={(e) =>
              setDownPaymentPercent(Number(e.target.value))
            }
            aria-valuemin={MIN_DOWN_PERCENT}
            aria-valuemax={MAX_DOWN_PERCENT}
            aria-valuenow={Math.round(downPercent)}
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {currencyLabel ?? ""} {formatCurrency(state.downPayment, locale)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mortgage-rate">{t("rate")}</Label>
            <div className="relative">
              <Input
                id="mortgage-rate"
                type="number"
                inputMode="decimal"
                min={MIN_RATE}
                max={MAX_RATE}
                step={0.1}
                value={state.annualRate}
                onChange={(e) =>
                  setAnnualRate(clamp(Number(e.target.value), MIN_RATE, MAX_RATE))
                }
              />
              <span className="pointer-events-none absolute inset-y-0 end-2 flex items-center text-sm text-muted-foreground">
                %
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mortgage-term">{t("term")}</Label>
            <div className="relative">
              <Input
                id="mortgage-term"
                type="number"
                inputMode="numeric"
                min={MIN_TERM}
                max={MAX_TERM}
                step={1}
                value={state.termYears}
                onChange={(e) =>
                  setTermYears(
                    clamp(Number(e.target.value), MIN_TERM, MAX_TERM)
                  )
                }
              />
              <span className="pointer-events-none absolute inset-y-0 end-2 flex items-center text-sm text-muted-foreground">
                {t("years")}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3" data-testid="mortgage-summary">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("monthlyPayment")}
            </span>
            <span
              className="text-2xl font-bold tabular-nums text-primary"
              data-testid="mortgage-monthly"
            >
              {formatCurrency(result.monthlyPayment, locale)}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-muted-foreground">{t("principal")}</dt>
              <dd className="font-medium tabular-nums">
                {formatCurrency(loanPrincipal, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("totalInterest")}</dt>
              <dd className="font-medium tabular-nums">
                {formatCurrency(result.totalInterest, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("totalCost")}</dt>
              <dd className="font-medium tabular-nums">
                {formatCurrency(result.totalCost, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("payments")}</dt>
              <dd className="font-medium tabular-nums">
                {result.numberOfPayments}
              </dd>
            </div>
          </dl>
        </div>

        <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  )
}