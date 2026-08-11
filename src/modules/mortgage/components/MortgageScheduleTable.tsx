"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Table } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"

import { useMortgage } from "../useMortgage"
import { buildAmortizationSchedule } from "../mortgageCalc"

interface MortgageScheduleTableProps {
  initialPrice: number
  className?: string
  defaultOpen?: boolean
}

export function MortgageScheduleTable({
  initialPrice,
  className,
  defaultOpen = false,
}: MortgageScheduleTableProps) {
  const t = useTranslations("mortgage.schedule")
  const [open, setOpen] = useState(defaultOpen)
  const { state, result } = useMortgage(initialPrice)
  const rows = open
    ? buildAmortizationSchedule(
        {
          principal: state.principal,
          annualRate: state.annualRate,
          termYears: state.termYears,
        },
        60
      )
    : []

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Table className="size-4 text-primary" aria-hidden="true" />
            {t("title")}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? t("hide") : t("show")}
          </Button>
        </div>
      </CardHeader>
      {open && rows.length > 0 && (
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs tabular-nums">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="py-2 pe-2 text-start font-medium">
                    {t("month")}
                  </th>
                  <th className="py-2 pe-2 text-start font-medium">
                    {t("payment")}
                  </th>
                  <th className="py-2 pe-2 text-start font-medium">
                    {t("interest")}
                  </th>
                  <th className="py-2 pe-2 text-start font-medium">
                    {t("principal")}
                  </th>
                  <th className="py-2 text-start font-medium">
                    {t("balance")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.month} className="border-b border-border/40">
                    <td className="py-1.5 pe-2">{row.month}</td>
                    <td className="py-1.5 pe-2">
                      {row.payment.toFixed(0)}
                    </td>
                    <td className="py-1.5 pe-2 text-muted-foreground">
                      {row.interest.toFixed(0)}
                    </td>
                    <td className="py-1.5 pe-2">{row.principal.toFixed(0)}</td>
                    <td className="py-1.5">{row.remainingBalance.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.numberOfPayments > rows.length && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("truncated", {
                shown: rows.length,
                total: result.numberOfPayments,
              })}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}