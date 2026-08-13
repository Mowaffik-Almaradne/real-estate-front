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

import { getRentalCardLabel, rentalCardStatusLabel } from "../labels"
import { RentalCardStatus } from "../types/enums"
import type { RentalCardFilters } from "../types/dto"

interface RentalCardFiltersBarProps {
  initial?: RentalCardFilters
  loading?: boolean
  onApply: (filters: RentalCardFilters) => void
}

const STATUS_OPTIONS: Array<{ value: RentalCardStatus; key: string }> = [
  { value: RentalCardStatus.active, key: "rentalCards.status.active" },
  { value: RentalCardStatus.ended, key: "rentalCards.status.ended" },
  { value: RentalCardStatus.cancelled, key: "rentalCards.status.cancelled" },
  { value: RentalCardStatus.renewed, key: "rentalCards.status.renewed" },
]

export function RentalCardFiltersBar({
  initial = {},
  loading = false,
  onApply,
}: RentalCardFiltersBarProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getRentalCardLabel(locale, key, vars)
  const [search, setSearch] = useState(initial.search ?? "")
  const [status, setStatus] = useState<RentalCardStatus | "">(
    (initial.status as RentalCardStatus | undefined) ?? ""
  )
  const [propertyId, setPropertyId] = useState<string>(
    initial.property_id ? String(initial.property_id) : ""
  )
  const [from, setFrom] = useState(initial.start_date ?? "")
  const [to, setTo] = useState(initial.end_date ?? "")

  const apply = () => {
    onApply({
      search: search.trim() || undefined,
      status: status || undefined,
      property_id: propertyId ? Number(propertyId) : undefined,
      start_date: from || undefined,
      end_date: to || undefined,
    })
  }

  const reset = () => {
    setSearch("")
    setStatus("")
    setPropertyId("")
    setFrom("")
    setTo("")
    onApply({})
  }

  return (
    <div className="rounded-md border p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="size-4" />
        <span className="font-medium">{label("rentalCards.filter.search")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="filter-search">{label("rentalCards.filter.search")}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="filter-search"
              className="pl-9"
              placeholder={label("rentalCards.filter.searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{label("rentalCards.filter.status")}</Label>
          <Select
            value={status || "all"}
            onValueChange={(value) =>
              setStatus(value === "all" ? "" : (value as RentalCardStatus))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={label("rentalCards.filter.statusAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{label("rentalCards.filter.statusAll")}</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {rentalCardStatusLabel(locale, option.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-property-id">{label("rentalCards.filter.propertyId")}</Label>
          <Input
            id="filter-property-id"
            type="number"
            min={1}
            value={propertyId}
            onChange={(event) => setPropertyId(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-from">{label("rentalCards.filter.from")}</Label>
          <Input
            id="filter-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-to">{label("rentalCards.filter.to")}</Label>
          <Input
            id="filter-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={reset} disabled={loading}>
          <RotateCcw className="size-4 mr-1" />
          {label("rentalCards.filter.reset")}
        </Button>
        <Button type="button" onClick={apply} disabled={loading}>
          {loading && <Loader2 className="size-4 mr-1 animate-spin" />}
          {label("rentalCards.filter.apply")}
        </Button>
      </div>
    </div>
  )
}
