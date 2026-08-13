"use client"

import { useState } from "react"
import { Filter, Loader2, RotateCcw, Search } from "lucide-react"
import { useLocale } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  DEPOSIT_CURRENCIES,
  DepositCurrency,
  DepositStatus,
} from "../types/enums"
import {
  depositStatusLabel,
  getDepositLabel,
} from "../labels"
import type { DepositFilters } from "../types/dto"

interface DepositFiltersBarProps {
  initial?: DepositFilters
  loading?: boolean
  onApply: (filters: DepositFilters) => void
}

const STATUS_OPTIONS: Array<{ value: DepositStatus; key: string }> = [
  { value: DepositStatus.pending, key: "deposits.status.pending" },
  { value: DepositStatus.held, key: "deposits.status.held" },
  { value: DepositStatus.released, key: "deposits.status.released" },
  { value: DepositStatus.refunded, key: "deposits.status.refunded" },
  { value: DepositStatus.disputed, key: "deposits.status.disputed" },
  { value: DepositStatus.cancelled, key: "deposits.status.cancelled" },
]

export function DepositFiltersBar({
  initial = {},
  loading = false,
  onApply,
}: DepositFiltersBarProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)
  const [search, setSearch] = useState(initial.search ?? "")
  const [status, setStatus] = useState<DepositStatus | "">(
    (initial.status as DepositStatus | undefined) ?? ""
  )
  const [currency, setCurrency] = useState<DepositCurrency | "">(
    (initial.currency as DepositCurrency | undefined) ?? ""
  )
  const [propertyId, setPropertyId] = useState<string>(
    initial.property_id ? String(initial.property_id) : ""
  )

  const apply = () => {
    onApply({
      search: search.trim() || undefined,
      status: status || undefined,
      currency: (currency || undefined) as DepositCurrency | undefined,
      property_id: propertyId ? Number(propertyId) : undefined,
    })
  }

  const reset = () => {
    setSearch("")
    setStatus("")
    setCurrency("")
    setPropertyId("")
    onApply({})
  }

  return (
    <div className="rounded-md border p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="size-4" />
        <span className="font-medium">{label("deposits.filter.search")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-2">
          <Label htmlFor="deposit-filter-search">
            {label("deposits.filter.search")}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="deposit-filter-search"
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{label("deposits.filter.status")}</Label>
          <Select
            value={status || "all"}
            onValueChange={(value) =>
              setStatus(value === "all" ? "" : (value as DepositStatus))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={label("deposits.filter.statusAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{label("deposits.filter.statusAll")}</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {depositStatusLabel(locale, option.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{label("deposits.filter.currency")}</Label>
          <Select
            value={currency || "all"}
            onValueChange={(value) =>
              setCurrency(value === "all" ? "" : (value as DepositCurrency))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={label("deposits.filter.currencyAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{label("deposits.filter.currencyAll")}</SelectItem>
              {DEPOSIT_CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deposit-filter-property-id">
            {label("deposits.fields.property")} ID
          </Label>
          <Input
            id="deposit-filter-property-id"
            type="number"
            min={1}
            value={propertyId}
            onChange={(event) => setPropertyId(event.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={reset} disabled={loading}>
          <RotateCcw className="size-4 mr-1" />
          {label("deposits.filter.reset")}
        </Button>
        <Button type="button" onClick={apply} disabled={loading}>
          {loading && <Loader2 className="size-4 mr-1 animate-spin" />}
          {label("deposits.filter.apply")}
        </Button>
      </div>
    </div>
  )
}
